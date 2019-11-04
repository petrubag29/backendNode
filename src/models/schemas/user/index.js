const mongoose = require('mongoose');
const CustomError = require('../../../utils/CustomError');
const agentSchema = require('../../schemas/user/agentSchema');
const adminSchema = require('../../schemas/user/adminSchema');
const customerSchema = require('../../schemas/user/customerSchema');
const { beforeSave } = require('../../../utils/authFuncUtils');
const { capitalize } = require('../../../utils/stringUtils');

const {
  validatePassword,
  validateName,
  validateEmail,
} = require('./validations/user');

const nameErrorMessage = 'Name must be between 3 and 30 characters long.';

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: [2, nameErrorMessage],
      maxlength: [50, nameErrorMessage],
      trim: true,
      validate: {
        validator: validateName,
        message: 'Name must be between 3 and 30 characters.',
      },
    },
    lastName: {
      type: String,
      required: true,
      minlength: [2, nameErrorMessage],
      maxlength: [50, nameErrorMessage],
      trim: true,
      validate: {
        validator: validateName,
        message: 'Name must be between 3 and 50 characters.',
      },
    },
    uuid: { type: String, required: true, index: { unique: true } },
    email: {
      type: String,
      index: { unique: true },
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validateEmail,
        message:
          'Please enter a valid email that is less that 100 characters long.',
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: validatePassword,
        message: 'Password must be between 8 and 30 characters.',
      },
    },
    role: {
      type: String,
      required: true,
      enum: ['customer', 'agent', 'admin', 'super-admin'],
    },
    createdAt: {
      type: Date,
      required: true,
    },
    lastLoginTimestamp: {
      type: Date,
    },
    lastJWTTokenReceived: {
      type: String,
    },
    agent: {
      type: agentSchema,
    },
    admin: {
      type: adminSchema,
    },
    customer: {
      type: customerSchema,
    },
    forgotPasswordToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', true, beforeSave);

userSchema.post('save', (error, doc, next) => {
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
  if (error.name === 'BulkWriteError' && error.code === 11000) {
    throw new CustomError('Normal', 'That email has already been registered.');
  }
  if (error) throw new Error(error);
  next();
});

async function findByUUID(uuid) {
  const user = await this.findOne({ uuid }).exec();
  return user;
}

async function findByEmail(email) {
  const user = await this.findOne({ email }).exec();
  return user;
}

userSchema.static('findByUUID', findByUUID);

userSchema.static('findByEmail', findByEmail);

userSchema.virtual('fullName').get(function getFullName() {
  return `${capitalize(this.firstName)} ${capitalize(this.lastName)}`;
});

module.exports = userSchema;
