const agents = require('./agents');
const customers = require('./customers');
const admin = require('./admin');

module.exports = {
  ...customers,
  ...agents,
  ...admin,
};
