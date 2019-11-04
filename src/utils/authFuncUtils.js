const bcrypt = require('bcryptjs');
const CustomError = require('../utils/CustomError');

async function hashPassword(password, saltRounds = 10) {
  let salt;
  let hashedPassword;
  try {
    salt = await bcrypt.genSalt(saltRounds);
    hashedPassword = await bcrypt.hash(password, salt);
  } catch (err) {
    throw new CustomError('Exception', 'Hashing the password has failed');
  }
  return hashedPassword;
}

async function beforeSave(next, done) {
  next();
  let hashedPassword;
  try {
    hashedPassword = await hashPassword(this.password);
  } catch (err) {
    done(err);
    return;
  }

  this.password = hashedPassword;
  this.email = this.email.trim();
  this.firstName = this.firstName.trim();
  this.lastName = this.lastName.trim();
  done();
}

module.exports = {
  beforeSave,
  hashPassword,
};
