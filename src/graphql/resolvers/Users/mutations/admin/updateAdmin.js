const User = require('../../../../../models/User');
const cleanUserInput = require('../../../../../utils/cleanUserInput');
const { logger } = require('../../../../../utils/logger');
const { capitalize } = require('../../../../../utils/stringUtils');
const {
  admin: adminRole,
  superAdmin,
} = require('../../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');
const objectToDotNotation = require('../../../../../utils/updateMongoDocWithNestedFields');

// AWS.config.update({ branch: 'ap-northeast-1' });

async function updateAdmin(obj, args, context, info) {
  const { currentUser, res, req } = context;

  if (!currentUser || currentUser.role !== superAdmin) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid } = args.input;

  console.log(uuid);

  const {
    firstName,
    lastName,
    email,
    role,
    officeNumber,
    mobileNumber,
    branch,
    state,
  } = cleanUserInput(args.input);

  const updateAdminReturn = {
    admin: null,
    wasSuccessful: false,
    userErrors: [],
    otherError: null,
  };

  // TODO: perform server-side validations on user inputs

  const userChanges = objectToDotNotation({
    firstName: capitalize(firstName),
    lastName: capitalize(lastName),
    email,
    role,
    admin: {
      officeNumber,
      mobileNumber,
      state,
      branch,
    },
  });

  let admin;

  // TODO: perform server-side validations on user inputs

  try {
    admin = await User.findByUUID(uuid);
  } catch (err) {
    updateAdminReturn.error = err;
    logger.log('error', err);
    return updateAdminReturn;
  }

  if (!admin) {
    updateAdminReturn.otherError =
      'The admin that you are attmpting to edit cannot be found.';
    return updateAdminReturn;
  }

  try {
    admin = await User.findOneAndUpdate(
      { uuid },
      { $set: { ...userChanges } },
      { new: true }
    );
    updateAdminReturn.admin = admin;
  } catch (err) {
    if (err.custom && err.type === 'Normal') {
      if (err.errors) {
        Object.keys(err.errors).forEach(key => {
          updateAdminReturn.userErrors.push({
            field: key,
            message: err.errors[key],
          });
        });
      } else {
        updateAdminReturn.userErrors.push({
          field: 'email',
          message: 'That email has already been registered.',
        });
      }
      return updateAdminReturn;
    }
    logger.log('error', err);
    throw err;
  }

  if (!updateAdminReturn.userErrors.length) {
    updateAdminReturn.wasSuccessful = true;
  }

  return updateAdminReturn;
}

module.exports = updateAdmin;
