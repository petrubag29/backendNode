const userMutations = require('./Users/mutations');
const dealMutations = require('./Deals/mutations');
const invoiceMutations = require('./Invoices/mutations');
const companyMutations = require('./Company/mutations');
const FormSelectItems = require('./FormSelectItems/mutations');
const listingMutations = require('./Listing/mutations');
module.exports = {
  ...userMutations,
  ...dealMutations,
  ...invoiceMutations,
  ...companyMutations,
  ...FormSelectItems,
  ...listingMutations,
};
