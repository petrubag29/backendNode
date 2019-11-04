const moment = require('moment');
const User = require('../../../../../models/User');
const { logger } = require('../../../../../utils/logger');
const generateRandomID = require('../../../../../utils/idGenerator');
const { sendOne } = require('../../../../../services/nodemailer');
const { address } = require('../../../../../constants/companyInfo');
const createResetPasswordToken = require('../../../../../utils/createResetPasswordToken');

async function userForgotPassword(obj, args, context) {
  const { currentUser, res } = context;
  const { email } = args;
  let user;

  console.log(email);

  const forgotPasswordReturn = {
    wasSuccessful: false,
    userErrors: [],
  };

  if (currentUser) {
    forgotPasswordReturn.userErrors.push({
      field: 'other',
      message: 'You are already logged',
    });
    return forgotPasswordReturn;
  }

  if (!email) {
    forgotPasswordReturn.userErrors.push({
      field: 'email',
      message: 'Email field is required',
    });
  }

  if (forgotPasswordReturn.userErrors.length) return forgotPasswordReturn;

  try {
    user = await User.findByEmail(email);
  } catch (err) {
    logger.log('error', err);
    throw err;
  }

  if (!user) {
    forgotPasswordReturn.userErrors.push({
      field: 'other',
      message: 'There is no user found with that email address.',
    });
    return forgotPasswordReturn;
  }

  const forgotPasswordToken = await createResetPasswordToken({ user });

  try {
    await User.update(
      { email },
      {
        $set: {
          forgotPasswordToken,
        },
      }
    );
  } catch (err) {
    logger.log('error', err);
    console.log(err);
    throw err;
  }

  try {
    sendOne({
      to: email,
      template: 'forgot-password',
      subject: 'Password Reset',
      templateArgs: {
        currentYear: moment().year(),
        companyAddress: address,
        resetEmailLink: `${
          process.env.WEBSITE_URL
        }/forgot-password?forgotPasswordToken=${forgotPasswordToken}`,
      },
    });
  } catch (err) {
    logger.log('error', err);
  }

  forgotPasswordReturn.wasSuccessful = true;

  return forgotPasswordReturn;
}

module.exports = userForgotPassword;
