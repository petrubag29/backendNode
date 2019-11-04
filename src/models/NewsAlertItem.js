const mongoose = require('mongoose');
const newsAlertItemSchema = require('./schemas/newsAlertItem');

// create the User model
const NewsAlertItem = mongoose.model('NewsAlertItem', newsAlertItemSchema);

module.exports = NewsAlertItem;
