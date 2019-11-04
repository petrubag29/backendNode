const cleanUserInput = require('../../../../utils/cleanUserInput');
const { agent: agentRole } = require('../../../../constants/userTypes');
const Invoice = require('../../../../models/Invoice');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');
const FormSelectItem = require('../../../../models/FormSelectItem');

const updateInvoice = async (obj, args, context, info) => {
  const { currentUser, res, req } = context;

  const returnObj = {
    invoice: undefined,
    userErrors: [],
    otherError: null,
  };

  if (!currentUser || currentUser.role !== agentRole) {
    throwUnautorizedAccessError(req, info);
  }

  const {
    invoiceID,
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
    attention,
    attentionEmail,
    addedManagementCompanies,
  } = cleanUserInput(args.input);

  const invoiceToUpdate = {
    agentType: currentUser.agent.agentType,
    invoiceType,
    propertyAddress,
    state: currentUser.agent.state,
    city,
    apartmentNumber,
    managementOrCobrokeCompany,
    price,
    clientName,
    // clientPhoneNumber,
    paymentItems,
    total,
    agentNotes,
    attention,
    attentionEmail,
    updatedAt: new Date(),
  };

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
  } else if (invoice.agentID !== currentUser.uuid) {
    returnObj.otherError =
      'You must be the creator of the invoice in order to update it.';
    return returnObj;
  }

  try {
    invoice = await invoice.set({ ...invoiceToUpdate }).save();
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
        { selectItemID: 'submitInvoiceForm.managementOrCobrokeCompanies' },
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

module.exports = updateInvoice;
