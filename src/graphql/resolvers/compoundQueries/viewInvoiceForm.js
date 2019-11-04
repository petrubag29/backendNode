const { logger } = require('../../../utils/logger');
const {
  superAdmin,
  admin,
  agent: agentRole,
} = require('../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../utils/throwUnauthorizedError');
const Invoice = require('../../../models/Invoice');
const FormSelectItem = require('../../../models/FormSelectItem');

const viewInvoiceFormQuery = async (obj, args, context, info) => {
  const { currentUser, req } = context;

  const returnObj = {
    formSelectItems: [],
    invoice: null,
    error: null,
  };

  if (!currentUser) {
    throwUnautorizedAccessError(req, info);
  }

  if (![agentRole, admin, superAdmin].includes(currentUser.role)) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid: invoiceID } = args;

  try {
    returnObj.invoice = await Invoice.findByInvoiceID(invoiceID);
  } catch (err) {
    logger.log('error', JSON.stringify(err));
    throw err;
  }

  if (!returnObj.invoice) {
    returnObj.error =
      'There is currently no invoice with the given invoice ID.';
    return returnObj;
  }

  if (
    currentUser.role === agentRole &&
    returnObj.invoice.agentID !== currentUser.uuid
  ) {
    throwUnautorizedAccessError(req, info);
  }

  try {
    const formSelectItems = await FormSelectItem.findBySelectItemID(
      'submitDealForm.managementOrCobrokeCompanies'
    );
    if (formSelectItems && formSelectItems.itemStringValues.length) {
      returnObj.formSelectItems = formSelectItems.itemStringValues.map(
        item => item.value
      );
    }
  } catch (err) {
    logger.log('error', JSON.stringify(err));
    throw err;
  }

  return returnObj;
};

module.exports = viewInvoiceFormQuery;
