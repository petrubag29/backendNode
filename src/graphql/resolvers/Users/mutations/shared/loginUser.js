const bcrypt = require('bcryptjs');
const User = require('../../../../../models/User');
const cleanUserInput = require('../../../../../utils/cleanUserInput');
const setJWTCookies = require('../../../../../utils/setJWTCookies');
const { logger } = require('../../../../../utils/logger');

async function loginUser(obj, args, context) {
  const { currentUser, res } = context;
  const { email, password } = cleanUserInput(args.input);
  const inputs = { email, password };
  let user;

  const registerUserReturn = {
    user: null,
    wasSuccessful: false,
    userErrors: [],
    otherError: null,
  };

  if (currentUser) {
    registerUserReturn.userErrors.push({
      field: 'other',
      message: 'You are already logged',
    });
    return registerUserReturn;
  }

  Object.keys(inputs).forEach(key => {
    const item = inputs[key];
    if (item === undefined) {
      registerUserReturn.userErrors.push({
        field: key,
        message: 'This field should not be undefined',
      });
    }
  });

  if (registerUserReturn.userErrors.length) return registerUserReturn;

  try {
    user = await User.findByEmail(email);
  } catch (err) {
    logger.log('error', err);
    throw err;
  }

  if (!user) {
    registerUserReturn.userErrors.push({
      field: 'other',
      message: 'There is no user found with that email address.',
    });
    return registerUserReturn;
  }

  const hash = user.password;
  let response;
  try {
    response = await bcrypt.compare(password, hash);
  } catch (err) {
    logger.log('error', err);
    throw err;
  }

  if (!response) {
    registerUserReturn.userErrors.push({
      field: 'other',
      message: 'Your password/email combination is incorrect.',
    });
    return registerUserReturn;
  }

  if (!user) {
    registerUserReturn.otherError = {
      field: 'other',
      message:
        "We're sorry. There was an error logging you in. Please try again shortly.",
    };
    return registerUserReturn;
  }

  let tokenRes;

  try {
    const { token } = await setJWTCookies({ res, user });
    tokenRes = token;
  } catch (err) {
    logger.log('error', err);
    throw err;
  }

  try {
    await User.update(
      { email },
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

  registerUserReturn.wasSuccessful = true;
  registerUserReturn.user = user;

  return registerUserReturn;
}

module.exports = loginUser;
