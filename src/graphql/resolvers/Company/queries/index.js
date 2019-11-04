const NewsAlertItem = require('../../../../models/NewsAlertItem');
const { logger } = require('../../../../utils/logger');
const { superAdmin, admin, agent } = require('../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');

module.exports = {
  newsAlertItems: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    let newsAlertItems;

    if (!currentUser) {
      throwUnautorizedAccessError(req, info);
    }

    if (![agent, admin, superAdmin].includes(currentUser.role)) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      newsAlertItems = await NewsAlertItem.find({}).exec();
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return newsAlertItems;
  },
};
