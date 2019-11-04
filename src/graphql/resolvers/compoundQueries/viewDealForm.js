const { logger } = require('../../../utils/logger');
const {
  superAdmin,
  admin,
  agent: agentRole,
} = require('../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../utils/throwUnauthorizedError');
const User = require('../../../models/User');
const Deal = require('../../../models/Deal');
const FormSelectItem = require('../../../models/FormSelectItem');

const viewDealFormQuery = async (obj, args, context, info) => {
  const { currentUser, req } = context;

  const returnObj = {
    agents: null,
    formSelectItems: [],
    deal: null,
    error: null,
  };

  if (!currentUser) {
    throwUnautorizedAccessError(req, info);
  }

  if (![agentRole, admin, superAdmin].includes(currentUser.role)) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid: dealID, userId } = args;

  try {
    returnObj.deal = await Deal.findByDealID(dealID, userId, currentUser);
  } catch (err) {
    logger.log('error', JSON.stringify(err));
    throw err;
  }

  if (!returnObj.deal) {
    returnObj.error = 'There is currently no deal with the given deal ID.';
    return returnObj;
  }

  const isCurrentAgent = returnObj.deal.agentID === currentUser.uuid;
  const isCoAgent = !!returnObj.deal.deductionItems.find(
    v => v.agentID === currentUser.uuid
  );

  if (currentUser.role === agentRole && (!isCurrentAgent && !isCoAgent)) {
    throwUnautorizedAccessError(req, info);
  }

  try {
    returnObj.agents = await User.find({ role: agentRole }).exec();
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
  console.log(currentUser);
  return returnObj;
};

module.exports = viewDealFormQuery;
