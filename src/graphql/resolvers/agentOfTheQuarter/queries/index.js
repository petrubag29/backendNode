const AgentOfTheQuarter = require('../../../../models/AgentOfTheQuarter');
const { logger } = require('../../../../utils/logger');
const { superAdmin, admin, agent } = require('../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');

module.exports = {
  agentsOfTheQuarter: async (obj, args, context, info) => {
    const { currentUser, req } = context;

    if (!currentUser) throwUnautorizedAccessError(req, info);

    if (
      currentUser.role !== agent &&
      currentUser.role !== superAdmin &&
      currentUser.role !== admin
    ) {
      throwUnautorizedAccessError(req, info);
    }

    let agentsOfTheQuarter;

    const returnObj = {
      commercialDollarsAgent: null,
      residentialDollarsAgent: null,
      rentalsDollarsAgent: null,
      numbersAgent: null,
    };

    try {
      agentsOfTheQuarter = await AgentOfTheQuarter.find({}).exec();
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    agentsOfTheQuarter.forEach(item => {
      switch (item.type) {
        case 'residentialDollarsAgent':
          returnObj.residentialDollarsAgent = item;
          break;
        case 'commercialSalesAgent':
          returnObj.commercialDollarsAgent = item;
          break;
        case 'rentalsAgent':
          returnObj.rentalsDollarsAgent = item;
          break;
        default:
          returnObj.numbersAgent = item;
      }
    });

    return returnObj;
  },
};
