const mongoose = require('mongoose');
const listingSchema = require('./schemas/listing');

// create the User model
const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
