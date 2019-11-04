const mongoose = require('mongoose');
const CustomError = require('../../../utils/CustomError');
const moment = require('moment');

const invoiceSchema = mongoose.Schema(
  {
    invoiceID: {
      type: String,
      required: true,
      index: { unique: true },
    },
    date: {
      type: Date,
      required: true,
    },
    agentID: {
      type: String,
      required: true,
      index: true,
    },
    agentName: {
      type: String,
      required: true,
    },
    agentRealEstateLicenseNumber: {
      type: String,
      required: true,
      index: true,
    },
    agentType: {
      type: Number,
      required: true,
    },
    invoiceType: {
      type: String,
      required: true,
    },
    propertyAddress: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
    },
    apartmentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    managementOrCobrokeCompany: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    // clientPhoneNumber: {
    //   type: String,
    //   required: true,
    // },
    paymentItems: [
      {
        paymentType: {
          type: String,
          required: true,
          trim: true,
        },
        checkOrTransactionNumber: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    attention: {
      type: String,
      required: true,
    },
    attentionEmail: {
      type: String,
      required: true,
    },
    /*
    shouldSendApprovalTextMessageNotification: {
      type: String,
      required: true,
    },
    */
    agentNotes: {
      type: String,
      trim: true,
    },
    updatedAt: {
      type: Date,
    },
    /*
    status: {
      type: String,
      required: true,
    },
    */
  },
  { timestamps: true }
);

invoiceSchema.post('save', (error, doc, next) => {
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
    throw new CustomError(
      'Normal',
      'That invoiceID has already been registered.'
    );
  }
  if (error) throw new Error(error);
  next();
});

async function findByInvoiceID(invoiceID) {
  const invoice = await this.findOne({ invoiceID }).exec();
  return invoice;
}

async function findByAgentID(agentID) {
  const invoices = await this.find({ agentID }).exec();
  return invoices;
}

async function findByAgentName(agentName) {
  const invoices = await this.find({ agentName }).exec();
  return invoices;
}

async function findByAgentRealEstateLicenseNumber(
  agentRealEstateLicenseNumber
) {
  const invoices = await this.find({ agentRealEstateLicenseNumber }).exec();
  return invoices;
}

async function findByDateRange(startDate, endDate) {
  const momentStartDate = moment(startDate);
  const momentEndDate = moment(endDate);

  if (!momentStartDate || !momentEndDate) return [];

  if (momentStartDate.isAfter(momentEndDate)) return [];

  const nativeStartDate = momentStartDate.toDate();
  const nativeEndDate = momentEndDate.toDate();

  const invoices = await this.find({
    date: {
      $gte: nativeStartDate,
      $lte: nativeEndDate,
    },
  }).exec();

  return invoices;
}

invoiceSchema.static('findByInvoiceID', findByInvoiceID);

invoiceSchema.static('findByAgentID', findByAgentID);

invoiceSchema.static('findByAgentName', findByAgentName);

invoiceSchema.static(
  'findByAgentRealEstateLicenseNumber',
  findByAgentRealEstateLicenseNumber
);

invoiceSchema.static('findByDateRange', findByDateRange);

module.exports = invoiceSchema;
