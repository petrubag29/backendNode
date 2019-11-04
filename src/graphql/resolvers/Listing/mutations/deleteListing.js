const {
  agent: agentRole,
  admin,
  superAdmin,
} = require('../../../../constants/userTypes');
const Listing = require('../../../../models/Listing');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');

const deleteListing = async (obj, args, context, info) => {
  const { currentUser, res, req } = context;

  const returnObj = {
    listingID: null,
    error: null,
  };

  if (!currentUser || currentUser.role !== agentRole) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid } = args;

  let listing;

  try {
    listing = await Listing.findByListingID(uuid);
    if (listing) returnObj.listingID = listing.listingID;
  } catch (err) {
    logger.log('error', err);
    returnObj.error = err;
    return returnObj;
  }

  if (!listing) {
    returnObj.error =
      'The invoice that you are attempting to delete has already been deleted.';
    return returnObj;
  } else if (
    currentUser.role === agentRole &&
    listing.agentID !== currentUser.uuid
  ) {
    returnObj.error =
      'You must be the creator of the invoice in order to update it.';
    return returnObj;
  }

  try {
    await Listing.deleteOne({ listingID: listing.listingID });
  } catch (err) {
    logger.log('error', err);
    returnObj.error = 'There was an error deleting the invoice!';
    return returnObj;
  }

  return returnObj;
};

module.exports = deleteListing;
