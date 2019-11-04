const moment = require('moment');
const cleanUserInput = require('../../../../utils/cleanUserInput');
const { agent: agentRole } = require('../../../../constants/userTypes');
const Deal = require('../../../../models/Deal');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');
const FormSelectItem = require('../../../../models/FormSelectItem');
const { sendOne } = require('../../../../services/nodemailer');
const { capitalize } = require('../../../../utils/stringUtils');
const { round } = require('../../../../utils/Math');
const { address, websiteURL } = require('../../../../constants/companyInfo');

const submitDeal = async (obj, args, context, info) => {
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
  } = cleanUserInput(args.input);

  const dealToSubmit = {
    dealID,
    date: new Date(),
    agentID: currentUser.uuid,
    agentName: currentUser.fullName,
    agentRealEstateLicenseNumber: currentUser.agent.realEstateLicenseNumber,
    agentType: currentUser.agent.agentType,
    leadSource,
    dealType,
    propertyAddress,
    state: currentUser.agent.state,
    branch: currentUser.agent.branch,
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
    ACHAccountNumber,
    ACHAccountBankRoutingNumber,
    shouldSendApprovalTextMessageNotification,
    status: 'pending',
  };

  const deductionItemsCoBrokering = deductionItems
    .filter(v => !!v && v.deductionType === 'Co-Brokering Split');

  dealToSubmit.coBrokeringAgentPaymentTypes = deductionItemsCoBrokering
    .map(v => ({
      agentID: v.agentID,
      status: 'pending',
      agentPaymentType: '',
      ACHAccountNumber: '',
      ACHAccountBankRoutingNumber: '',
    }));

  dealToSubmit.agencyDisclosureForm = `https://${
    process.env.AWS_S3_BUCKET_NAME
  }.s3.amazonaws.com/deals/${dealID}/agencyDisclosureForm/${
    dealToSubmit.agencyDisclosureForm
  }`;

  dealToSubmit.contractOrLeaseForms = dealToSubmit.contractOrLeaseForms.map(
    fileName =>
      `https://${
        process.env.AWS_S3_BUCKET_NAME
      }.s3.amazonaws.com/deals/${dealID}/contractOrLeaseForms/${fileName}`
  );

  let deal;

  const newDeal = new Deal(dealToSubmit);

  try {
    deal = await newDeal.save(dealToSubmit);
    returnObj.deal = deal;
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

  try {
    sendOne({
      to: currentUser.email,
      subject: `Deal Submission (Deal ID: ${deal.dealID})`,
      template: 'deal-submission',
      templateArgs: {
        dealID: deal.dealID,
        dealTotal: `$${round(deal.total, 0).toLocaleString()}`,
        viewDealLink: `${websiteURL}/app/`,
        firstName: capitalize(currentUser.firstName),
        currentYear: moment().year(),
        companyAddress: address,
        heroBackgroundImgURL:
          'https://s3.amazonaws.com/reyes-elsamad-real-estate-app/website-images/email/hero.jpg',
      },
    });
  } catch (err) {
    logger.log('error', err);
  }

  try {
    sendOne({
      to: process.env.APP_OWNER_EMAIL,
      subject: `Deal Submission (Deal ID: ${deal.dealID})`,
      template: 'deal-submission-admin-version',
      templateArgs: {
        dealID: deal.dealID,
        dealTotal: `$${round(deal.total, 0).toLocaleString()}`,
        viewDealLink: `${websiteURL}/app/`,
        firstName: capitalize(currentUser.firstName),
        currentYear: moment().year(),
        companyAddress: address,
        heroBackgroundImgURL:
          'https://s3.amazonaws.com/reyes-elsamad-real-estate-app/website-images/email/hero.jpg',
      },
    });
  } catch (err) {
    logger.log('error', err);
  }

  return returnObj;
};

module.exports = submitDeal;
