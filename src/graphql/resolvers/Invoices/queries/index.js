const Invoice = require('../../../../models/Invoice');
const { logger } = require('../../../../utils/logger');
const { superAdmin, admin, agent } = require('../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');

module.exports = {
  allInvoices: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    let invoices;

    if (!currentUser) throwUnautorizedAccessError(req, info);

    if (currentUser.role !== superAdmin && currentUser.role !== admin) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      invoices = await Invoice.find({}).exec();
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return invoices;
  },
  allInvoicesByDateRange: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    const { startDate, endDate } = args;
    let invoices;

    if (!currentUser) throwUnautorizedAccessError(req, info);

    if (currentUser.role !== superAdmin && currentUser.role !== admin) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      invoices = await Invoice.findByDateRange(startDate, endDate);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return invoices;
  },
  allInvoicesByAgentName: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    const { agentName } = args;
    let invoices;

    if (!currentUser) throwUnautorizedAccessError(req, info);

    if (currentUser.role !== superAdmin && currentUser.role !== admin) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      invoices = await Invoice.findByAgentName(agentName);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return invoices;
  },
  invoicesByAgentID: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    const { uuid } = args;
    let invoices;

    if (!currentUser) throwUnautorizedAccessError(req, info);

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
      invoices = await Invoice.findByAgentID(uuid);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return invoices;
  },
  invoicesByAgentRealEstateLicenseNumber: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    const { agentRealEstateLicenseNumber } = args;
    let invoices;

    if (!currentUser) throwUnautorizedAccessError(req, info);

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
      invoices = await Invoice.findByAgentRealEstateLicenseNumber(
        agentRealEstateLicenseNumber
      );
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return invoices;
  },
  invoice: async (obj, args, context, info) => {
    const { uuid: invoiceID } = args;
    const { currentUser, req } = context;
    let invoice;
    if (!currentUser) throwUnautorizedAccessError(req, info);

    if (
      currentUser.role !== superAdmin &&
      currentUser.role !== admin &&
      currentUser.role !== agent
    ) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      invoice = await Invoice.findByInvoiceID(invoiceID);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    if (!invoice) return null;

    if (currentUser.role === agent && currentUser.uuid !== invoice.agentID) {
      throwUnautorizedAccessError(req, info);
    }

    return invoice;

    // throwUnautorizedAccessError(req, info);
  },
};
