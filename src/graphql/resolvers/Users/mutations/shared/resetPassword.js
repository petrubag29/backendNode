const moment = require('moment');
const User = require('../../../../../models/User');
const { logger } = require('../../../../../utils/logger');
const generateRandomID = require('../../../../../utils/idGenerator');
const { sendOne } = require('../../../../../services/nodemailer');
const { address } = require('../../../../../constants/companyInfo');
const decodeForgotPasswordToken = require('../../../../../utils/decodeJWTForgotPasswordToken');

async function userForgotPassword(obj, args, context) {
  const { currentUser, res } = context;
  const { password, forgotPasswordToken } = args.input;
  let user;

  const resetPasswordReturn = {
    wasSuccessful: false,
    userErrors: [],
  };

  if (currentUser) {
    resetPasswordReturn.userErrors.push({
      field: 'other',
      message: 'You are already logged',
    });
    return resetPasswordReturn;
  }

  let decodedPayload;
  let tokenError;

  try {
    const response = await decodeForgotPasswordToken(forgotPasswordToken);
    decodedPayload = response.decodedPayload;
    tokenError = response.error;
  } catch (err) {
    logger.log('error', err);
    throw err;
  }

  if (tokenError || !decodedPayload.email) {
    resetPasswordReturn.userErrors.push({
      field: 'other',
      message:
        'The link used is either invalid or expired. Reset password links only last for a maximum of 24 hours.',
    });
    return resetPasswordReturn;
  }

  if (resetPasswordReturn.userErrors.length) return resetPasswordReturn;

  try {
    user = await User.findByEmail(decodedPayload.email);
  } catch (err) {
    logger.log('error', err);
    throw err;
  }

  if (!user) {
    resetPasswordReturn.userErrors.push({
      field: 'other',
      message:
        'There is no user associated with this link, or the link is not up to date. You may have created a new reset password link after creating this one.',
    });
    return resetPasswordReturn;
  }

  if (user.forgotPasswordToken !== forgotPasswordToken) {
    resetPasswordReturn.userErrors.push({
      field: 'other',
      message:
        'The link provided has already been used to reset your password and is no longer valid!',
    });
    return resetPasswordReturn;
  }

  try {
    await user.set({ password, forgotPasswordToken: '' }).save();
  } catch (err) {
    logger.log('error', err);
    console.log(err);
    throw err;
  }

  try {
    sendOne({
      to: user.email,
      template: 'password-reset',
      subject: 'Password Reset',
      templateArgs: {
        currentYear: moment().year(),
        companyAddress: address,
      },
    });
  } catch (err) {
    logger.log('error', err);
  }

  resetPasswordReturn.wasSuccessful = true;

  return resetPasswordReturn;
}

module.exports = userForgotPassword;
