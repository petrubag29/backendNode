const moment = require('moment');
const { admin, superAdmin } = require('../../../../constants/userTypes');
const Invoice = require('../../../../models/Invoice');
const User = require('../../../../models/User');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');
const { address } = require('../../../../constants/companyInfo');
const { sendOne } = require('../../../../services/nodemailer');
const { capitalize } = require('../../../../utils/stringUtils');
const { websiteURL } = require('../../../../constants/companyInfo');

const acceptInvoice = async (obj, args, context, info) => {
  const { currentUser, res, req } = context;

  const returnObj = {
    invoice: undefined,
    userErrors: [],
    otherError: null,
  };

  if (
    !currentUser ||
    (currentUser.role !== admin && currentUser.role !== superAdmin)
  ) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid: invoiceID } = args;

  let invoice;

  try {
    invoice = await Invoice.findByInvoiceID(invoiceID);
  } catch (err) {
    logger.log('error', err);
    returnObj.otherError = err;
    return returnObj;
  }

  if (!invoice) {
    returnObj.otherError =
      'The invoice that you are attempting to update has already been deleted.';
    return returnObj;
  } else if (invoice.status === 'accepted') {
    returnObj.otherError =
      'The invoice that you are attempting to accept has already been accepted.';
    return returnObj;
  }

  try {
    invoice = await invoice.set({ status: 'approved' }).save();
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

  let agent;

  try {
    agent = await User.findByUUID(invoice.agentID);
  } catch (err) {
    logger.log('error', err);
    returnObj.otherError = err;
    return returnObj;
  }

  if (agent) {
    try {
      sendOne({
        to: agent.email,
        subject: `Invoice Approval (Invoice ID: ${invoice.invoiceID})`,
        template: 'invoice-approval',
        templateArgs: {
          invoiceID: invoice.invoiceID,
          firstName: capitalize(agent.firstName),
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

  return returnObj;
};

module.exports = acceptInvoice;
