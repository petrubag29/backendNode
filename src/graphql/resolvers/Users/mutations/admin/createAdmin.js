const generateRandomID = require('../../../../../utils/idGenerator');
const User = require('../../../../../models/User');
const cleanUserInput = require('../../../../../utils/cleanUserInput');
const { logger } = require('../../../../../utils/logger');
const {
  admin: adminRole,
  superAdmin,
} = require('../../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');
const { capitalize } = require('../../../../../utils/stringUtils');

async function createAdmin(obj, args, context, info) {
  const { currentUser, res, req } = context;

  if (!currentUser || currentUser.role !== superAdmin) {
    throwUnautorizedAccessError(req, info);
  }

  const {
    firstName,
    lastName,
    email,
    officeNumber,
    mobileNumber,
    branch,
    state,
    temporaryPassword,
    role,
  } = cleanUserInput(args.input);

  let admin;

  const createAdminReturn = {
    admin: null,
    signedURL: null,
    wasSuccessful: false,
    userErrors: [],
    otherError: null,
  };

  // TODO: perform server-side validations on user inputs

  const uuid = generateRandomID();

  if (role !== adminRole && role !== superAdmin) {
    createAdminReturn.userErrors.push({
      field: 'role',
      message: 'Please supply a valid admin role.',
    });
    return createAdminReturn;
  }

  const newUser = new User({
    uuid,
    firstName: capitalize(firstName),
    lastName: capitalize(lastName),
    email,
    role,
    password: temporaryPassword,
    createdAt: new Date(),
    admin: {
      officeNumber,
      mobileNumber,
      state,
      branch,
      createdByID: currentUser.uuid,
      createdByName: capitalize(
        `${currentUser.firstName} ${currentUser.lastName}`
      ),
    },
  });

  try {
    admin = await newUser.save();
    createAdminReturn.admin = admin;
  } catch (err) {
    if (err.custom && err.type === 'Normal') {
      if (err.errors) {
        console.log(err);
        Object.keys(err.errors).forEach(key => {
          createAdminReturn.userErrors.push({
            field: key,
            message: err.errors[key],
          });
        });
      } else {
        createAdminReturn.userErrors.push({
          field: 'email',
          message: 'That email has already been registered.',
        });
      }
      return createAdminReturn;
    }
    logger.log('error', err);
    throw err;
  }

  if (!createAdminReturn.userErrors.length) {
    createAdminReturn.wasSuccessful = true;
  }

  console.log(createAdminReturn);

  return createAdminReturn;
}

module.exports = createAdmin;
