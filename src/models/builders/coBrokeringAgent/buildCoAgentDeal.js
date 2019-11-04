/* eslint-disable prefer-destructuring */
const { getAgentSplitAmount, getNetCommissions } = require('./helpers');

const { capitalize } = require('../../../utils/stringUtils');
const { agent } = require('../../../constants/userTypes');

exports.buildCoAgentDeal = (deal, user, currentUser, isInternal) => {
  if (!deal || !user || isInternal) {
    return deal;
  }
  const isLoggedUserAgent = currentUser.role === agent;
  const isTheSameUser = user.uuid === currentUser.uuid;
  const isLoggedUserCoAgent =
    deal.agentID !== currentUser.uuid && isLoggedUserAgent;
  const isCoAgentDeal = deal.agentID !== user.uuid;
  const coBrokeringAgentPaymentTypes = deal.coBrokeringAgentPaymentTypes || [];
  let { agentName, status, total, agentType } = deal;
  if (!isLoggedUserAgent && !isTheSameUser) {
    agentName = `${capitalize(user.firstName)} ${capitalize(user.lastName)}`;
    agentType = user.agent.agentType;
  }

  if (isCoAgentDeal) {
    const commissions = getNetCommissions(deal, user.uuid, user.agent);
    deal.deductionsTotal = 0;
    deal.netAgentCommission = commissions.netAgentCommission;
    deal.netCompanyCommission = commissions.netCompanyCommission;
    status = coBrokeringAgentPaymentTypes[0]
      ? coBrokeringAgentPaymentTypes[0].status
      : status;
    total = getAgentSplitAmount(deal, user.uuid);
  }

  if (isCoAgentDeal && !isLoggedUserCoAgent) {
    total = getAgentSplitAmount(deal, user.uuid);
  }

  if (isLoggedUserCoAgent) {
    deal.ACHAccountNumber = '';
    deal.ACHAccountBankRoutingNumber = '';
  }

  return Object.assign(deal, {
    agentName,
    agentType,
    status,
    coBrokeringAgentPaymentTypes,
    idCoAgent: isCoAgentDeal,
    total,
  });
};
