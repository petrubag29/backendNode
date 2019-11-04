const mongoose = require('mongoose');
const CustomError = require('../../../utils/CustomError');

const newsAlertItemSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      index: true,
    },
    html: {
      type: String,
      required: true,
    },
    string: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
      enum: ['news', 'alert'],
    },
  },
  { timestamps: true }
);

newsAlertItemSchema.post('save', (error, doc, next) => {
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

newsAlertItemSchema.plugin(require('mongoose-ttl'), { ttl: '14d' });

module.exports = newsAlertItemSchema;
