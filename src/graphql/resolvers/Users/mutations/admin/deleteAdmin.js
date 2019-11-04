const {
  admin: adminRole,
  superAdmin,
  secondaryTypes: { owner },
} = require('../../../../../constants/userTypes');
const User = require('../../../../../models/User');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');
const InvalidJWTItem = require('../../../../../models/InvalidJWTItem');
const { logger } = require('../../../../../utils/logger');

const deleteAdmin = async (obj, args, context, info) => {
  const { currentUser, res, req } = context;

  const returnObj = {
    error: null,
  };

  if (!currentUser || currentUser.role !== superAdmin) {
    throwUnautorizedAccessError(req, info);
  }

  if (!currentUser.admin || !currentUser.admin.isAdminOwner) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid } = args;

  let admin;

  try {
    admin = await User.findByUUID(uuid);
  } catch (err) {
    logger.log('error', err);
    returnObj.error = err;
    return returnObj;
  }

  if (!admin) {
    returnObj.error =
      'The admin that you are attempting to delete cannot be found!';
    return returnObj;
  }

  if (currentUser.uuid === uuid) {
    returnObj.error =
      'Admin may not delete themselves. Delete operation must be handled by a different admin!';
    return returnObj;
  }

  if (admin.admin.isAdminOwner) {
    returnObj.error =
      'The admin that you are attempting to delete cannot be deleted!';
    return returnObj;
  }

  if (admin.lastJWTTokenReceived) {
    const newInvalidJWTItem = new InvalidJWTItem({
      JWT: admin.lastJWTTokenReceived,
    });

    try {
      await newInvalidJWTItem.save();
    } catch (err) {
      logger.log('error', err);
      returnObj.error = 'There was an error deleting the admin!';
      return returnObj;
    }
  }

  try {
    await User.deleteOne({ uuid: admin.uuid });
  } catch (err) {
    logger.log('error', err);
    returnObj.error = 'There was an error deleting the admin!';
    return returnObj;
  }

  return returnObj;
};

module.exports = deleteAdmin;
