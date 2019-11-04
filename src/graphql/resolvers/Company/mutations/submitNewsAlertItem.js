const {
  agent: agentRole,
  admin,
  superAdmin,
} = require('../../../../constants/userTypes');
const NewsAlertItem = require('../../../../models/NewsAlertItem');
const generateRandomID = require('../../../../utils/idGenerator');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');

const submitNewsAlertItem = async (obj, args, context, info) => {
  const { currentUser, res, req } = context;

  const returnObj = {
    item: null,
    error: null,
  };

  if (
    !currentUser ||
    (currentUser.role !== admin && currentUser.role !== superAdmin)
  ) {
    throwUnautorizedAccessError(req, info);
  }

  const { html, string, type } = args.input;

  if (type !== 'news' && type !== 'alert') {
    returnObj.error = 'Item type must either be "news" or "alert"!';
    return returnObj;
  }

  const uuid = generateRandomID();

  const submittedNewsAlertItem = {
    type,
    html,
    string,
    uuid,
  };

  const newNewsAlertItem = new NewsAlertItem(submittedNewsAlertItem);
  let newsAlertItem;

  try {
    newsAlertItem = await newNewsAlertItem.save();
    returnObj.item = newsAlertItem;
  } catch (err) {
    logger.log('error', err);
    returnObj.error = err;
    return returnObj;
  }

  if (!returnObj.item) {
    returnObj.error = 'There was a problem saving your item!';
  }

  return returnObj;
};

module.exports = submitNewsAlertItem;
