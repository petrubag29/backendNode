const mongoose = require('mongoose');
const invalidJWTItemSchema = require('./schemas/invalidJWTItem');

// create the User model
const InvalidJWTItem = mongoose.model('InvalidJWTItem', invalidJWTItemSchema);

module.exports = InvalidJWTItem;
