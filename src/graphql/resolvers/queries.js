const userQueries = require('./Users/queries');
const agentOfTheQuarterQueries = require('./agentOfTheQuarter/queries');
const dealQueries = require('./Deals/queries');
const invoiceQueries = require('./Invoices/queries');
const companyQueries = require('./Company/queries');
const FormSelectItems = require('./FormSelectItems/queries');
const CompoundQueries = require('./compoundQueries');
const listingQueries = require('./Listing/queries');
module.exports = {
  ...userQueries,
  ...dealQueries,
  ...invoiceQueries,
  ...companyQueries,
  ...FormSelectItems,
  ...CompoundQueries,
  ...agentOfTheQuarterQueries,
  ...listingQueries,
};
