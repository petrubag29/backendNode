const cleanUserInput = require('../../../../utils/cleanUserInput');
const { agent: agentRole } = require('../../../../constants/userTypes');
const Listing = require('../../../../models/Listing');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');
const FormSelectItem = require('../../../../models/FormSelectItem');

const updateListing = async (obj, args, context, info) => {
  const { currentUser, res, req } = context;

  const returnObj = {
    listing: undefined,
    userErrors: [],
    otherError: null,
  };

  if (!currentUser || currentUser.role !== agentRole) {
    throwUnautorizedAccessError(req, info);
  }

  const { listingID, address } = cleanUserInput(args.input);

  const listingToUpdate = {
    address,
    updatedAt: new Date(),
  };

  let listing;

  try {
    listing = await Listing.findByListingID(listingID);
  } catch (err) {
    logger.log('error', err);
    returnObj.otherError = err;
    return returnObj;
  }

  if (!listing) {
    returnObj.otherError =
      'The invoice that you are attempting to update has already been deleted.';
    return returnObj;
  } else if (invoice.agentID !== currentUser.uuid) {
    returnObj.otherError =
      'You must be the creator of the invoice in order to update it.';
    return returnObj;
  }

  try {
    listing = await listing.set({ ...listingToUpdate }).save();
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

module.exports = updateListing;
