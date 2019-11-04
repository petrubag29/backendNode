const moment = require('moment');
const cleanUserInput = require('../../../../utils/cleanUserInput');
const { agent: agentRole } = require('../../../../constants/userTypes');
const generateRandomID = require('../../../../utils/idGenerator');
const Listing = require('../../../../models/Listing');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');
const FormSelectItem = require('../../../../models/FormSelectItem');
const { sendOne } = require('../../../../services/nodemailer');
const { capitalize } = require('../../../../utils/stringUtils');
const { round } = require('../../../../utils/Math');
const { address, websiteURL } = require('../../../../constants/companyInfo');

const createListing = async (obj, args, context, info) => {
  const { currentUser, res, req } = context;

  const returnObj = {
    listing: null,
    userErrors: [],
    otherError: null,
  };

  if (!currentUser || currentUser.role !== agentRole) {
    throwUnautorizedAccessError(req, info);
  }

  const { address, price, description } = cleanUserInput(args.input);

  const listingToSubmit = {
    listingID: generateRandomID(),
    agentID: currentUser.uuid,
    agentName: currentUser.fullName,
    address,
    price,
    description,
  };
  console.log('-----------', listingToSubmit);
  let listing;

  const newListing = new Listing(listingToSubmit);

  try {
    listing = await newListing.save(listingToSubmit);
    returnObj.listing = listing;
  } catch (err) {
    if (err.custom && err.type === 'Normal') {
      if (err.errors) {
        Object.keys(err.errors).forEach(key => {
          returnObj.userErrors.push({
            field: key,
            message: err.errors[key],
          });
        });
      } else {
        logger.log('error', err);
        returnObj.otherError = err;
      }
    }
    return returnObj;
  }

  return returnObj;
};

module.exports = createListing;
