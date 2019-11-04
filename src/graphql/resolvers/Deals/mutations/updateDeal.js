const moment = require('moment');
const { sendOne } = require('../../../../services/nodemailer');
const { capitalize } = require('../../../../utils/stringUtils');
const {
  buildCoAgentDeal,
} = require('../../../../models/builders/coBrokeringAgent/buildCoAgentDeal');
const cleanUserInput = require('../../../../utils/cleanUserInput');
const { agent: agentRole } = require('../../../../constants/userTypes');
const Deal = require('../../../../models/Deal');
const User = require('../../../../models/User');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');
const FormSelectItem = require('../../../../models/FormSelectItem');
const deleteUploaded3Files = require('../../../../services/aws/s3/deleteFile');
const { address, websiteURL } = require('../../../../constants/companyInfo');

const updateCoBrokeringAgentPaymentTypes = (
  paymentTypesOld,
  paymentTypeNewArray
) => {
  const paymentTypesOldObject = paymentTypesOld.toObject();
  const paymentTypeNew = paymentTypeNewArray[0];
  const index = paymentTypesOldObject.findIndex(
    v => v.agentID === paymentTypeNew.agentID
  );
  if (index < 0) {
    return paymentTypesOldObject;
  }
  const paymentTypeOld = paymentTypesOldObject[index];
  paymentTypesOldObject[index] = {
    ...paymentTypeOld,
    ...paymentTypeNew,
    status: 'approved',
  };
  return paymentTypesOldObject;
};

const updateDeal = async (obj, args, context, info) => {
  const { currentUser, req } = context;

  const returnObj = {
    deal: undefined,
    userErrors: [],
    otherError: null,
  };

  if (!currentUser || currentUser.role !== agentRole) {
    throwUnautorizedAccessError(req, info);
  }

  const {
    dealID,
    leadSource,
    dealType,
    propertyAddress,
    city,
    apartmentNumber,
    managementOrCobrokeCompany,
    price,
    clientName,
    clientEmail,
    paymentItems,
    paymentsTotal,
    deductionItems,
    deductionsTotal,
    total,
    agentNotes,
    agencyDisclosureForm,
    contractOrLeaseForms,
    agentPaymentType,
    fundsPaidBy,
    alreadyTurnedFundsIn,
    shouldSendApprovalTextMessageNotification,
    addedManagementCompanies,
    ACHAccountNumber,
    ACHAccountBankRoutingNumber,
    coBrokeringAgentPaymentTypes,
  } = cleanUserInput(args.input);

  const dealToUpdate = {
    // agentType: currentUser.agent.agentType,
    leadSource,
    dealType,
    propertyAddress,
    state: currentUser.agent.state,
    city,
    apartmentNumber,
    managementOrCobrokeCompany,
    price,
    clientName,
    clientEmail,
    paymentItems,
    paymentsTotal,
    deductionItems,
    deductionsTotal,
    total,
    agentNotes,
    agentPaymentType,
    fundsPaidBy,
    alreadyTurnedFundsIn,
    shouldSendApprovalTextMessageNotification,
    ACHAccountNumber,
    ACHAccountBankRoutingNumber,
    updatedAt: new Date(),
  };

  let deal;

  try {
    deal = await Deal.findByDealID(dealID, currentUser.uuid, currentUser, true);
  } catch (err) {
    logger.log('error', err);
    returnObj.otherError = err;
    return returnObj;
  }

  let { status } = deal;

  const coBrokeringAgentPaymentType = deal.coBrokeringAgentPaymentTypes.find(
    v => v.agentID === currentUser.uuid
  );

  if (coBrokeringAgentPaymentType) {
    status = 'approved';
    dealToUpdate.total = deal.total;
    dealToUpdate.ACHAccountNumber = deal.ACHAccountNumber;
    dealToUpdate.ACHAccountBankRoutingNumber = deal.ACHAccountBankRoutingNumber;
  }

  const canUpdate =
    deal.agentID === currentUser.uuid || !!coBrokeringAgentPaymentType;

  dealToUpdate.coBrokeringAgentPaymentTypes = updateCoBrokeringAgentPaymentTypes(
    deal.coBrokeringAgentPaymentTypes,
    coBrokeringAgentPaymentTypes
  );

  if (!deal) {
    returnObj.otherError =
      'The deal that you are attempting to update has already been deleted.';
    return returnObj;
  } else if (!canUpdate) {
    returnObj.otherError =
      'You must be the creator of the deal in order to update it.';
    return returnObj;
  }

  if (agencyDisclosureForm) {
    dealToUpdate.agencyDisclosureForm = `https://${
      process.env.AWS_S3_BUCKET_NAME
      }.s3.amazonaws.com/deals/${dealID}/agencyDisclosureForm/${agencyDisclosureForm}`;
  }

  if (contractOrLeaseForms.length) {
    dealToUpdate.contractOrLeaseForms = contractOrLeaseForms.map(
      fileName =>
        `https://${
        process.env.AWS_S3_BUCKET_NAME
        }.s3.amazonaws.com/deals/${dealID}/contractOrLeaseForms/${fileName}`
    );
  }

  const agencyDisclosureFormFileName = deal.agencyDisclosureForm
    .split('/')
    .pop();

  const contractOrLeaseFormsFileNames = deal.contractOrLeaseForms.map(url =>
    url.split('/').pop()
  );

  const agencyDisclosureFormPath = `deals/${
    deal.dealID
    }/agencyDisclosureForm/${agencyDisclosureFormFileName}`;

  const contractOrLeaseFormPaths = contractOrLeaseFormsFileNames.map(
    fileName => `deals/${deal.dealID}/contractOrLeaseForms/${fileName}`
  );

  if (agencyDisclosureForm || contractOrLeaseForms.length) {
    let response;

    if (agencyDisclosureForm && contractOrLeaseForms.length) {
      response = await deleteUploaded3Files(
        [agencyDisclosureFormPath, ...contractOrLeaseFormPaths].map(path => ({
          Key: path,
        }))
      );
    } else if (agencyDisclosureForm) {
      response = await deleteUploaded3Files(
        [agencyDisclosureFormPath].map(path => ({
          Key: path,
        }))
      );
    } else if (contractOrLeaseForms.length) {
      response = await deleteUploaded3Files(
        [...contractOrLeaseFormPaths].map(path => ({
          Key: path,
        }))
      );
    }

    console.log(response);

    if (response.error) {
      console.log(response.error);
      returnObj.error =
        'There was an error updating your uploaded files for this deal.';
      return returnObj;
    }
  }

  try {
    deal = await deal.set({ ...dealToUpdate, status }).save();
    returnObj.deal = buildCoAgentDeal(deal, currentUser, currentUser);
  } catch (err) {
    if (err.custom && err.type === 'Normal') {
      if (err.errors) {
        Object.keys(err.errors).forEach(key => {
          returnObj.userErrors.push({
            field: key,
            message: err.errors[key],
          });
        });
      } else {
        logger.log('error', err);
        returnObj.otherError = err;
      }
    }
    return returnObj;
  }

  if (coBrokeringAgentPaymentType) {
    const user = await User.findByUUID(currentUser.uuid);
    try {
      //  sendOne({
      //     to: process.env.APP_OWNER_EMAIL,
      //     template: 'co-broker-accepted',
      //     subject: `Co-brokering agent updated the payment details (Deal ID: ${
      //       deal.dealID
      //       })`,
      //     templateArgs: {
      //       dealID: deal.dealID,
      //       firstName: capitalize(user.firstName),
      //       heroBackgroundImgURL:
      //         'https://s3.amazonaws.com/reyes-elsamad-real-estate-app/website-images/email/hero.jpg',
      //     },
      //   });

      sendOne({
        to: process.env.APP_OWNER_EMAIL,
        subject: `Co-broker has entered payment details (Deal ID: ${deal.dealID})`,
        template: 'payment-details-added',
        templateArgs: {
          dealID: deal.dealID,
          viewDealLink: `${websiteURL}/app/`,
          firstName: capitalize(user.firstName),
          currentYear: moment().year(),
          companyAddress: address,
          heroBackgroundImgURL:
            'https://s3.amazonaws.com/reyes-elsamad-real-estate-app/website-images/email/hero.jpg',
        },
      });
    } catch (err) {
      logger.log('error', err);
    }
  }

  if (addedManagementCompanies.length) {
    const addedManagementCompanyInsertItems = addedManagementCompanies.map(
      companyName => ({
        value: companyName,
        addedBy: {
          uuid: currentUser.uuid,
          name: currentUser.fullName,
          createdAt: new Date(),
        },
      })
    );

    try {
      await FormSelectItem.update(
        { selectItemID: 'submitDealForm.managementOrCobrokeCompanies' },
        {
          $push: {
            itemStringValues: { $each: addedManagementCompanyInsertItems },
          },
        }
      );
    } catch (err) {
      logger.log('error', err);
      returnObj.otherError = err;
      return returnObj;
    }
  }

  return returnObj;
};

module.exports = updateDeal;
