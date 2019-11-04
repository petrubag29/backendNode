const mongoose = require('mongoose');

const agentSchema = mongoose.Schema({
  agentType: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  areaOfFocus: {
    type: [String],
  },
  branch: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  officeNumber: {
    type: String,
  },
  realEstateLicenseNumber: {
    type: String,
    required: true,
    trim: true,
  },
  profilePicURL: {
    type: String,
  },
  ACHAccountNumber: {
    type: String,
    trim: true,
  },
  ACHAccountBankRoutingNumber: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  facebook: {
    type: String,
    trim: true,
  },
  twitter: {
    type: String,
    trim: true,
  },
  instagram: {
    type: String,
    trim: true,
  },
  profileDescription: {
    type: String,
    trim: true,
  },
  createdByID: {
    type: String,
    required: true,
  },
  createdByName: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
  },
  updatedBy: {
    type: String,
  },
});

module.exports = agentSchema;
