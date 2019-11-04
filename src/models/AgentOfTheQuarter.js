const mongoose = require('mongoose');
const agentOfTheQuarterSchema = require('./schemas/agentOfTheQuarter');

// create the User model
const AgentOfTheMonth = mongoose.model(
  'agentofthequarters',
  agentOfTheQuarterSchema
);

module.exports = AgentOfTheMonth;
