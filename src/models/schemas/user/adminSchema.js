const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
  branch: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  officeNumber: {
    type: String,
    required: true,
  },
  profilePicURL: {
    type: String,
  },
  isAdminOwner: {
    type: Boolean,
  },
  createdByID: {
    type: String,
  },
  createdByName: {
    type: String,
  },
  updatedAt: {
    type: Date,
  },
  updatedBy: {
    type: String,
  },
});

module.exports = adminSchema;
