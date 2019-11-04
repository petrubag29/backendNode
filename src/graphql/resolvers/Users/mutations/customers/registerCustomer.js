const generateRandomID = require('../../../../../utils/idGenerator');
const User = require('../../../../../models/User');
const cleanUserInput = require('../../../../../utils/cleanUserInput');
const setJWTCookies = require('../../../../../utils/setJWTCookies');
const { logger } = require('../../../../../utils/logger');
const {
  customer: customerRole,
} = require('../../../../../constants/userTypes');

async function registerCustomer(obj, args, context) {
  const { currentUser, res } = context;
  const { firstName, lastName, email, password, interest } = cleanUserInput(
    args.input
  );
  const inputs = { firstName, lastName, email, password, interest };
  let customer;

  const registerCustomerReturn = {
    customer: null,
    wasSuccessful: false,
    userErrors: [],
    otherError: null,
  };

  if (currentUser) {
    registerCustomerReturn.userErrors.push({
      field: 'other',
      message: 'You are already logged in!',
    });
    return registerCustomerReturn;
  }

  Object.keys(inputs).forEach(key => {
    const item = inputs[key];
    if (item === undefined && key !== 'interest') {
      registerCustomerReturn.userErrors.push({
        field: key,
        message: 'This field should not be undefined!',
      });
    }
  });

  if (registerCustomerReturn.userErrors.length) return registerCustomerReturn;

  const newUser = new User({
    uuid: generateRandomID(),
    firstName,
    lastName,
    email,
    password,
    role: customerRole,
  });

  try {
    customer = await newUser.save();
    registerCustomerReturn.customer = customer;
  } catch (err) {
    if (err.custom && err.type === 'Normal') {
      if (err.errors) {
        Object.keys(err.errors).forEach(key => {
          registerCustomerReturn.userErrors.push({
            field: key,
            message: err.errors[key],
          });
        });
      } else {
        registerCustomerReturn.userErrors.push({
          field: 'other',
          message: 'That email has already been registered.',
        });
      }
      return registerCustomerReturn;
    }
    logger.log('error', err);
    throw err;
  }

  let tokenRes;

  if (customer) {
    try {
      const { token } = await setJWTCookies({ res, user: customer });
      tokenRes = token;
    } catch (err) {
      logger.log('error', err);
      throw err;
    }
  }

  try {
    await User.update(
      { email: customer.email },
      {
        $set: {
          lastLoginTimestamp: new Date(),
          lastJWTTokenReceived: tokenRes,
        },
      }
    );
  } catch (err) {
    logger.log('error', err);
    console.log(err);
    throw err;
  }

  if (!registerCustomerReturn.userErrors.length) {
    registerCustomerReturn.wasSuccessful = true;
  }

  return registerCustomerReturn;
}

module.exports = registerCustomer;
