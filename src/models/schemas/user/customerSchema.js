const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
  profilePicURL: {
    type: String,
  },
  interest: {
    type: String,
  },
  likedProperties: {
    type: [String],
  },
  updatedBy: {
    type: String,
  },
});

module.exports = customerSchema;
