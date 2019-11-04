const { logger } = require('../../../utils/logger');
const {
  superAdmin,
  admin,
  agent: agentRole,
} = require('../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../utils/throwUnauthorizedError');
const User = require('../../../models/User');
const FormSelectItem = require('../../../models/FormSelectItem');

const dealFormQuery = async (obj, args, context, info) => {
  const { currentUser, req } = context;

  const returnObj = {
    agent: null,
    formSelectItems: [],
    agents: [],
  };

  if (!currentUser) {
    throwUnautorizedAccessError(req, info);
  }

  if (![agentRole, admin, superAdmin].includes(currentUser.role)) {
    throwUnautorizedAccessError(req, info);
  }

  let uuid;

  if (currentUser.role === agentRole) {
    uuid = currentUser.uuid;
  } else {
    uuid = args.uuid;
  }

  try {
    returnObj.agent = await User.findByUUID(uuid);
  } catch (err) {
    logger.log('error', JSON.stringify(err));
    throw err;
  }

  try {
    returnObj.agents = await User.find({ role: 'agent' }).exec();
  } catch (err) {
    logger.log('error', JSON.stringify(err));
    throw err;
  }

  try {
    const formSelectItems = await FormSelectItem.findBySelectItemID(
      'submitDealForm.managementOrCobrokeCompanies'
    );
    if (formSelectItems && formSelectItems.itemStringValues.length) {
      returnObj.formSelectItems = formSelectItems.itemStringValues.map(
        item => item.value
      );
    }
  } catch (err) {
    logger.log('error', JSON.stringify(err));
    throw err;
  }

  return returnObj;
};

module.exports = dealFormQuery;
