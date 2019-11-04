const emailValidator = require('email-validator');

function validatePassword(password) {
  if (!password || password.length < 8 || password.length > 30) {
    return false;
  }
  return true;
}

function validateName(fullName) {
  if (!fullName) return false;

  const trimmedFullName = fullName.trim();
  const isTooShort = trimmedFullName.length < 2;
  const isTooLong = trimmedFullName.length > 50;

  if (isTooShort || isTooLong) {
    return false;
  }
  return true;
}

function validateEmail(email) {
  if (!email) return false;
  const trimmedEmail = email.trim();
  const isValidEmail = emailValidator.validate(trimmedEmail);
  const isTooLong = trimmedEmail.length > 100;
  if (isTooLong || !isValidEmail) return false;
  return true;
}

module.exports = {
  validatePassword,
  validateName,
  validateEmail,
};
