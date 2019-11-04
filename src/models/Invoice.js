const mongoose = require('mongoose');
const invoiceSchema = require('./schemas/invoice');

// create the User model
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
