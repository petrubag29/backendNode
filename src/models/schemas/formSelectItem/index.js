const mongoose = require('mongoose');
const CustomError = require('../../../utils/CustomError');

const formSelectItemSchema = mongoose.Schema({
  selectItemID: {
    type: String,
    required: true,
    index: { unique: true },
  },
  formName: {
    type: String,
    required: true,
    index: true,
  },
  itemName: {
    type: String,
    required: true,
    index: true,
  },
  itemStringValues: [
    {
      value: String,
      addedBy: {
        uuid: String,
        name: String,
        createdAt: Date,
      },
    },
  ],
  itemNumValues: [
    {
      value: Number,
      addedBy: {
        uuid: String,
        name: String,
        createdAt: Date,
      },
    },
  ],
});

formSelectItemSchema.post('save', (error, doc, next) => {
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

async function findByFormAndItemName(formName, itemName) {
  const formItem = await this.findOne({ formName, itemName }).exec();
  return formItem;
}

async function findBySelectItemID(selectItemID) {
  const formItem = await this.findOne({ selectItemID }).exec();
  return formItem;
}

formSelectItemSchema.static('findByFormAndItemName', findByFormAndItemName);
formSelectItemSchema.static('findBySelectItemID', findBySelectItemID);

module.exports = formSelectItemSchema;
