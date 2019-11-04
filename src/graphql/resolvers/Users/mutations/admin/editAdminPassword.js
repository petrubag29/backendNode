const User = require('../../../../../models/User');
const { logger } = require('../../../../../utils/logger');
const { superAdmin } = require('../../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');

async function editAdminPassword(obj, args, context, info) {
  const { currentUser, res, req } = context;

  const { uuid, newPassword } = args.input;

  if (!currentUser || currentUser.role !== superAdmin) {
    throwUnautorizedAccessError(req, info);
  }

  if (
    !currentUser.admin ||
    (!currentUser.admin.isAdminOwner && currentUser.uuid !== uuid)
  ) {
    throwUnautorizedAccessError(req, info);
  }

  const editAdminPasswordReturn = {
    userErrors: [],
    otherError: null,
  };

  let admin;

  // TODO: perform server-side validations on user inputs

  try {
    admin = await User.findByUUID(uuid);
  } catch (err) {
    editAdminPasswordReturn.error = err;
    logger.log('error', err);
    return editAdminPasswordReturn;
  }

  if (!admin) {
    editAdminPasswordReturn.error =
      'The admin that you are attmpting to edit cannot be found.';
    return editAdminPasswordReturn;
  }

  try {
    await admin.set({ password: newPassword }).save();
  } catch (err) {
    if (err.custom && err.type === 'Normal') {
      if (err.errors) {
        console.log(err);
        Object.keys(err.errors).forEach(key => {
          editAdminPasswordReturn.userErrors.push({
            field: key,
            message: err.errors[key],
          });
        });
      }
      return editAdminPasswordReturn;
    }
    editAdminPasswordReturn.otherError = err;
    logger.log('error', err);
    return editAdminPasswordReturn;
  }

  console.log(editAdminPasswordReturn);

  return editAdminPasswordReturn;
}

module.exports = editAdminPassword;
