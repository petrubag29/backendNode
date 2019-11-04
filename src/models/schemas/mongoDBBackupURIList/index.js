const mongoose = require('mongoose');
const CustomError = require('../../../utils/CustomError');

const mongoDBBackupURIListSchema = mongoose.Schema({
  UIRList: {
    type: [String],
    required: true,
  },
});

mongoDBBackupURIListSchema.post('save', (error, doc, next) => {
  if (error.errors) {
    const returnedErrors = error.errors;
    const errors = {};
    Object.keys(returnedErrors).forEach(key => {
      errors[key] = returnedErrors[key].message;
    });
    const errorResponse = new CustomError('Normal');
    errorResponse.errors = errors;
    errorResponse.validationErrors = true;
    throw errorResponse;
  }
  if (error) throw new Error(error);
  next();
});

module.exports = mongoDBBackupURIListSchema;
