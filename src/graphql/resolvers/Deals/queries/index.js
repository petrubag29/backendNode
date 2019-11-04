const Deal = require('../../../../models/Deal');
const { logger } = require('../../../../utils/logger');
const { superAdmin, admin, agent } = require('../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const {
  buildLeadDeals,
} = require('../../../../models/builders/coBrokeringAgent/buildLeadDeals');

module.exports = {
  allDeals: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    let deals;

    if (!currentUser) {
      throwUnautorizedAccessError(req, info);
    }

    if (currentUser.role !== superAdmin && currentUser.role !== admin) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      const allDeals = await Deal.find({}).exec();
      deals = await Promise.all(buildLeadDeals(allDeals));
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return deals;
  },
  allDealsByDateRange: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    const { startDate, endDate } = args.input;
    let deals;

    if (!currentUser) {
      throwUnautorizedAccessError(req, info);
    }

    if (currentUser.role !== superAdmin && currentUser.role !== admin) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      deals = await Deal.findByDateRange(startDate, endDate);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return deals;
  },
  allDealsByAgentName: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    const { agentName } = args;
    let deals;

    if (!currentUser) {
      throwUnautorizedAccessError(req, info);
    }

    if (currentUser.role !== superAdmin && currentUser.role !== admin) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      deals = await Deal.findByAgentName(agentName);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return deals;
  },
  dealsByAgentID: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    const { uuid } = args;
    let deals;
    if (!currentUser) {
      throwUnautorizedAccessError(req, info);
    }

    if (
      currentUser.role !== superAdmin &&
      currentUser.role !== admin &&
      currentUser.role !== agent
    ) {
      throwUnautorizedAccessError(req, info);
    }

    if (currentUser.role === agent && currentUser.uuid !== uuid) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      deals = await Deal.findByAgentID(uuid, currentUser);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return deals;
  },
  dealsByAgentRealEstateLicenseNumber: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    const { agentRealEstateLicenseNumber } = args;
    let deals;

    if (!currentUser) {
      throwUnautorizedAccessError(req, info);
    }

    if (
      currentUser.role !== superAdmin &&
      currentUser.role !== admin &&
      currentUser.role !== agent
    ) {
      throwUnautorizedAccessError(req, info);
    }

    if (
      currentUser.role === agent &&
      currentUser.agent.agentRealEstateLicenseNumber !==
        agentRealEstateLicenseNumber
    ) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      deals = await Deal.findByAgentRealEstateLicenseNumber(
        agentRealEstateLicenseNumber
      );
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return deals;
  },
  allDealsByClientName: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    const { clientName } = args;
    let deals;

    if (!currentUser) {
      throwUnautorizedAccessError(req, info);
    }

    if (currentUser.role !== superAdmin && currentUser.role !== admin) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      deals = await Deal.findByAgentName(clientName);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return deals;
  },
  deal: async (obj, args, context, info) => {
    const { uuid: dealID } = args;
    const { currentUser, req } = context;
    let deal;

    if (!currentUser) throwUnautorizedAccessError(req, info);

    if (
      currentUser.role !== superAdmin &&
      currentUser.role !== admin &&
      currentUser.role !== agent
    ) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      deal = await Deal.findByDealID(dealID);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    if (!deal) return null;

    if (currentUser.role === agent && currentUser.uuid !== deal.agentID) {
      throwUnautorizedAccessError(req, info);
    }

    if (currentUser.role !== admin && currentUser.role !== superAdmin) {
      delete deal._doc.netCompanyCommission;
    }

    return deal;

    // throwUnautorizedAccessError(req, info);
  },
};
