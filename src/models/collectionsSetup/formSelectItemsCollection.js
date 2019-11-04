const { logger } = require('../../utils/logger');

const setupFormSelectItemsCollection = async (Model, formSelectItemsExists) => {
  const item1 = {
    selectItemID: 'submitDealForm.managementOrCobrokeCompanies',
    formName: 'submitDealForm',
    itemName: 'managementOrCobrokeCompanies',
    itemStringValues: [],
    itemNumValues: [],
  };

  const item2 = {
    selectItemID: 'submitDealForm.dealTypes',
    formName: 'submitDealForm',
    itemName: 'dealTypes',
    itemStringValues: [],
    itemNumValues: [],
  };

  const item3 = {
    selectItemID: 'submitDealForm.fundsPaidBy',
    formName: 'submitDealForm',
    itemName: 'fundsPaidBy',
    itemStringValues: [],
    itemNumValues: [],
  };

  const item4 = {
    selectItemID: 'submitDealForm.paymentType',
    formName: 'submitDealForm',
    itemName: 'paymentType',
    itemStringValues: [],
    itemNumValues: [],
  };

  const item5 = {
    selectItemID: 'submitDealForm.deductionType',
    formName: 'submitDealForm',
    itemName: 'deductionType',
    itemStringValues: [],
    itemNumValues: [],
  };

  const item6 = {
    selectItemID: 'submitInvoiceForm.managementOrCobrokeCompanies',
    formName: 'submitDealForm',
    itemName: 'managementOrCobrokeCompanies',
    itemStringValues: [],
    itemNumValues: [],
  };

  const item7 = {
    selectItemID: 'submitInvoiceForm.invoiceTypes',
    formName: 'submitDealForm',
    itemName: 'dealTypes',
    itemStringValues: [],
    itemNumValues: [],
  };

  const item8 = {
    selectItemID: 'submitInvoiceForm.paymentType',
    formName: 'submitDealForm',
    itemName: 'paymentType',
    itemStringValues: [],
    itemNumValues: [],
  };

  const allItems = [item1, item2, item3, item4, item5, item6, item7, item8];

  if (formSelectItemsExists) {
    const docs = await Model.find({}).exec();
    const docsIDS = docs.map(item => item.selectItemID);

    if (docs.length === allItems.length) return;

    const itemsToInsert = allItems.filter(
      item => !docsIDS.includes(item.selectItemID)
    );

    try {
      await Model.insertMany(itemsToInsert);
    } catch (err) {
      logger.log('error', err);
      throw err;
    }

    return;
  }

  try {
    await Model.insertMany(allItems);
  } catch (err) {
    logger.log('error', err);
    throw err;
  }
};

module.exports = setupFormSelectItemsCollection;
