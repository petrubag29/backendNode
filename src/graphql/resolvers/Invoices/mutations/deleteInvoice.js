const {
  agent: agentRole,
  admin,
  superAdmin,
} = require('../../../../constants/userTypes');
const Invoice = require('../../../../models/Invoice');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');

const deleteInvoice = async (obj, args, context, info) => {
  const { currentUser, res, req } = context;

  const returnObj = {
    invoiceID: null,
    error: null,
  };

  if (!currentUser || currentUser.role !== agentRole) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid } = args;

  let invoice;

  try {
    invoice = await Invoice.findByInvoiceID(uuid);
    if (invoice) returnObj.invoiceID = invoice.invoiceID;
  } catch (err) {
    logger.log('error', err);
    returnObj.error = err;
    return returnObj;
  }

  if (!invoice) {
    returnObj.error =
      'The invoice that you are attempting to delete has already been deleted.';
    return returnObj;
  } else if (
    currentUser.role === agentRole &&
    invoice.agentID !== currentUser.uuid
  ) {
    returnObj.error =
      'You must be the creator of the invoice in order to update it.';
    return returnObj;
  }

  try {
    await Invoice.deleteOne({ invoiceID: invoice.invoiceID });
  } catch (err) {
    logger.log('error', err);
    returnObj.error = 'There was an error deleting the invoice!';
    return returnObj;
  }

  return returnObj;
};

module.exports = deleteInvoice;
