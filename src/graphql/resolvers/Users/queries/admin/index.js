const User = require('../../../../../models/User');
const { logger } = require('../../../../../utils/logger');
const {
  shouldReturnAllUsers,
  shouldReturnUser,
  returnViewableUserFields,
  returnAllUsersViewableFields,
} = require('../../../../../models/userRepository');
const {
  superAdmin,
  admin: adminRole,
} = require('../../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');

module.exports = {
  allAdmin: async (obj, args, context, info) => {
    const { currentUser, req } = context;
    let admin;

    if (
      !currentUser ||
      (currentUser.role !== superAdmin && currentUser.role !== adminRole)
    ) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      admin = await User.find()
        .or([{ role: adminRole }, { role: superAdmin }])
        .exec();
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    return returnAllUsersViewableFields(currentUser, admin);
  },
  admin: async (obj, args, context, info) => {
    const { uuid } = args;
    const { currentUser, req } = context;
    let singleAdmin;

    if (!currentUser || currentUser.role !== superAdmin) {
      throwUnautorizedAccessError(req, info);
    }

    try {
      singleAdmin = await User.findByUUID(uuid);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    if (singleAdmin) {
      console.log(singleAdmin);
      return returnViewableUserFields(currentUser, singleAdmin);
    }

    if (!singleAdmin) return null;

    // throwUnautorizedAccessError(req, info);
  },
};
