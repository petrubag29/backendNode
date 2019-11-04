const mongoose = require('mongoose');
const dealSchema = require('./schemas/deal');

// create the User model
const Deal = mongoose.model('Deal', dealSchema);

module.exports = Deal;
