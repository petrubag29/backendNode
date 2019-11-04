const mongoose = require('mongoose');
const formSelectItemSchema = require('./schemas/formSelectItem');

// create the User model
const FormSelectItem = mongoose.model('FormSelectItem', formSelectItemSchema);

module.exports = FormSelectItem;
