const User = require('../../../../../models/User');
const { logger } = require('../../../../../utils/logger');
const {
  shouldReturnAllUsers,
  shouldReturnUser,
  returnViewableUserFields,
  returnAllUsersViewableFields,
} = require('../../../../../models/userRepository');
const { superAdmin, admin } = require('../../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');

module.exports = {
  customers: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    let customers;

    if (
      !currentUser ||
      (currentUser.role !== superAdmin && currentUser.role !== admin)
    ) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      customers = await User.find({ role: 'customer' }).exec();
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return returnAllUsersViewableFields(currentUser, customers);
  },
  customer: async (obj, args, context) => {
    const { uuid } = args;
    const { currentUser, req } = context;
    let customer;

    if (!currentUser) throwUnautorizedAccessError(req, info);

    if (
      currentUser.role !== superAdmin &&
      currentUser.role !== admin &&
      !(currentUser.role === customer && currentUser.uuid === uuid)
    ) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      customer = await User.findByUUID(uuid);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    if (customer) {
      console.log(customer);
      return returnViewableUserFields(currentUser, customer);
    }

    if (!customer) return null;

    // throwUnautorizedAccessError(req, info);
  },
};
