const moment = require('moment');
const cleanUserInput = require('../../../../utils/cleanUserInput');
const { agent: agentRole } = require('../../../../constants/userTypes');
const generateRandomID = require('../../../../utils/idGenerator');
const Invoice = require('../../../../models/Invoice');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');
const FormSelectItem = require('../../../../models/FormSelectItem');
const { sendOne } = require('../../../../services/nodemailer');
const { capitalize } = require('../../../../utils/stringUtils');
const { round } = require('../../../../utils/Math');
const { address, websiteURL } = require('../../../../constants/companyInfo');

const submitInvoice = async (obj, args, context, info) => {
  const { currentUser, res, req } = context;

  const returnObj = {
    invoice: null,
    userErrors: [],
    otherError: null,
  };

  if (!currentUser || currentUser.role !== agentRole) {
    throwUnautorizedAccessError(req, info);
  }

  const {
    invoiceType,
    propertyAddress,
    city,
    apartmentNumber,
    managementOrCobrokeCompany,
    price,
    clientName,
    // clientPhoneNumber,
    paymentItems,
    total,
    agentNotes,
    // shouldSendApprovalTextMessageNotification,
    attention,
    attentionEmail,
    addedManagementCompanies,
  } = cleanUserInput(args.input);

  const invoiceToSubmit = {
    invoiceID: generateRandomID(),
    date: new Date(),
    agentID: currentUser.uuid,
    agentName: currentUser.fullName,
    agentRealEstateLicenseNumber: currentUser.agent.realEstateLicenseNumber,
    agentType: currentUser.agent.agentType,
    invoiceType,
    propertyAddress,
    state: currentUser.agent.state,
    city,
    branch: currentUser.agent.branch,
    apartmentNumber,
    managementOrCobrokeCompany,
    price,
    clientName,
    // clientPhoneNumber,
    paymentItems,
    total,
    agentNotes,
    // shouldSendApprovalTextMessageNotification,
    attention,
    attentionEmail,
    // status: 'pending',
  };

  let invoice;

  const newInvoice = new Invoice(invoiceToSubmit);

  try {
    invoice = await newInvoice.save(invoiceToSubmit);
    returnObj.invoice = invoice;
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

  try {
    sendOne({
      to: currentUser.email,
      subject: `Invoice Submission (Invoice ID: ${invoice.invoiceID})`,
      template: 'invoice-submission-invoicee-version',
      templateArgs: {
        date: invoice.date,
        invoiceID: invoice.invoiceID,
        clientName: invoice.attention,
        attentionEmail: invoice.attentionEmail,
        // clientPhoneNumber: invoice.clientPhoneNumber,
        agentName: capitalize(invoice.agentName),
        invoiceType: invoice.invoiceType,

        address: invoice.propertyAddress,
        apartmentNumber: invoice.apartmentNumber,
        price: invoice.price,
        total: invoice.total,
        notes: invoice.agentNotes,

        currentYear: moment().year(),
        companyAddress: address,
      },
    });
  } catch (err) {
    logger.log('error', err);
  }

  try {
    sendOne({
      to: invoice.attentionEmail,
      subject: `Invoice Submission (Invoice ID: ${invoice.invoiceID})`,
      template: 'invoice-submission-invoicee-version',
      templateArgs: {
        date: moment(invoice.date).format('ddd, MMM Do YYYY'),
        invoiceID: invoice.invoiceID,
        clientName: invoice.attention,
        attentionEmail: invoice.attentionEmail,
        // clientPhoneNumber: invoice.clientPhoneNumber,
        agentName: capitalize(invoice.agentName),
        invoiceType: invoice.invoiceType,

        address: invoice.propertyAddress,
        apartmentNumber: invoice.apartmentNumber,
        price: invoice.price,
        total: invoice.total,
        notes: invoice.agentNotes,

        currentYear: moment().year(),
        companyAddress: address,
      },
    });
  } catch (err) {
    logger.log('error', err);
  }

  return returnObj;
};

module.exports = submitInvoice;
