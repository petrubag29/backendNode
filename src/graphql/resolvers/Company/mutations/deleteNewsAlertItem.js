const { admin, superAdmin } = require('../../../../constants/userTypes');
const NewsAlertItem = require('../../../../models/NewsAlertItem');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');

const deleteNewsAlertItem = async (obj, args, context, info) => {
  const { currentUser, res, req } = context;

  const returnObj = {
    error: null,
  };

  if (
    !currentUser ||
    (currentUser.role !== admin && currentUser.role !== superAdmin)
  ) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid } = args;

  try {
    await NewsAlertItem.deleteOne({ uuid });
  } catch (err) {
    logger.log('error', err);
    returnObj.error = err;
    return returnObj;
  }

  return returnObj;
};

module.exports = deleteNewsAlertItem;
