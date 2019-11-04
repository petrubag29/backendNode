const { getAgentSplitAmount, getNetCommissions } = require('./helpers');
const { capitalize } = require('../../../utils/stringUtils');
const { agent } = require('../../../constants/userTypes');
const User = require('../../User');

exports.buildCoAgentDeals = (deals, agentId, user, currentUser) =>
  deals
    .filter(deal => deal.status === 'approved')
    .map(async deal => {
      const total = getAgentSplitAmount(deal, agentId);
      const isAgent = currentUser.role === agent;
      const { netAgentCommission, netCompanyCommission } = getNetCommissions(deal, agentId, user.agent);
      const isPending = deal.coBrokeringAgentPaymentTypes.find(v => v.agentID === agentId && v.status === 'pending');
      const [fName, lName] = deal.agentName.split(' ');
      let { agentName, status, deductionItems } = deal;
      if (!isAgent) {
        agentName = `${capitalize(user.firstName[0])} ${capitalize(user.lastName)}`;
        const getDeductionItems = deductionItems
          .map(async v => {
            if (v.agentID && v.agentID !== agentId) {
              const usr = await User.findByUUID(v.agentID);
              v.agentName = `${capitalize(usr.firstName[0])} ${capitalize(usr.lastName)}`;
              return v;
            }
            return v;
          });
        deductionItems = await Promise.all(getDeductionItems);
        deductionItems.push({
          deductionType: 'Co-Brokering Split',
          agentID: deal.agentID,
          agentName: `${fName[0]} ${lName}`,
        });
      }

      if (isPending) {
        status = 'pending';
      }

      return Object.assign(deal, {
        agentName,
        deductionsTotal: 0,
        total,
        netAgentCommission,
        netCompanyCommission,
        isCoAgent: true,
        agentType: user.agent.agentType,
        status,
        deductionItems,
      });
    });
