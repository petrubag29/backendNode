const getAgentSplitAmount = (deal, agentId) => {
  const agentSplitDeduction = deal.deductionItems.find(x => x.agentID === agentId);
  if (agentSplitDeduction) {
    return agentSplitDeduction.amount;
  }
  return deal.total;
};

const getNetCommissions = (deal, agentId, currentAgent) => {
  const { agentType } = currentAgent;
  const amount = getAgentSplitAmount(deal, agentId);
  const netAgentCommission = amount * (agentType / 100);
  const netCompanyCommission = amount - netAgentCommission;
  return {
    netAgentCommission,
    netCompanyCommission,
  };
};

exports.getAgentSplitAmount = getAgentSplitAmount;
exports.getNetCommissions = getNetCommissions;
