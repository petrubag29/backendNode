const mongoose = require('mongoose');
const User = require('../../User');
const CustomError = require('../../../utils/CustomError');
const moment = require('moment');
const { round } = require('../../../utils/Math');

const listingSchema = mongoose.Schema(
  {
    listingID: {
      type: String,
      required: true,
      index: { unique: true },
    },
    address: {
      type: String,
      required: true,
    },
    agentID: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    agentName: {
      type: String,
      required: true,
      trim: true,
    },
    featuredImage: {
      type: String,
    },
    images: {
      type: [String],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: String,
    },
    updatedAt: {
      type: Date,
    },
    updatedBy: {
      type: String,
    },
  },
  { timestamps: true }
);

async function findByListingID(listingID) {
  const listings = await this.findOne({ listingID }).exec();
  return listings;
}

async function findByAgentID(agentID) {
  const listings = await this.find({ agentID }).exec();
  return listings;
}

async function findByAgentName(agentName) {
  const listings = await this.find({ agentName }).exec();
  return listings;
}

listingSchema.static('findByAgentID', findByAgentID);

listingSchema.static('findByAgentName', findByAgentName);

listingSchema.static('findByListingID', findByListingID);

module.exports = listingSchema;
