const User = require('../../User');
const { capitalize } = require('../../../utils/stringUtils');

const buildLeadDeals = deals =>
  deals.map(async deal => {
    const getDeductionItems = deal.deductionItems
      .map(async v => {
        if (v.agentID) {
          const user = await User.findByUUID(v.agentID);
          v.agentName = `${capitalize(user.firstName[0])} ${capitalize(user.lastName)}`;
          return v;
        }
        return v;
      });
    const deductionItems = await Promise.all(getDeductionItems);
    const [fName, lName] = deal.agentName.split(' ');
    const agentName = `${fName[0]} ${lName}`;
    return Object.assign(deal, {
      deductionItems,
      agentName,
    });
  });

exports.buildLeadDeals = buildLeadDeals;
