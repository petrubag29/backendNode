const mongoose = require('mongoose');
const User = require('../../User');
const CustomError = require('../../../utils/CustomError');
const moment = require('moment');
const { round } = require('../../../utils/Math');
const { buildCoAgentDeals } = require('../../builders/coBrokeringAgent/buildCoAgentDeals');
const { buildCoAgentDeal } = require('../../builders/coBrokeringAgent/buildCoAgentDeal');
const { buildLeadDeals } = require('../../builders/coBrokeringAgent/buildLeadDeals');

const dealSchema = mongoose.Schema(
  {
    dealID: {
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
      trim: true,
    },
    agentName: {
      type: String,
      required: true,
      trim: true,
    },
    agentRealEstateLicenseNumber: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    agentType: {
      type: Number,
      required: true,
    },
    leadSource: {
      type: String,
      trim: true,
    },
    dealType: {
      type: String,
      required: true,
      enum: [
        'Residential Sale',
        'Residential Rental',
        'Commercial Sale',
        'Commercial Rental',
      ],
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
    clientEmail: {
      type: String,
      required: true,
      trim: true,
    },
    paymentItems: [
      {
        paymentType: {
          type: String,
          required: true,
          trim: true,
        },
        checkOrTransactionNumber: {
          type: String,
          required: false,
          defaultValue: "NA",
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    coBrokeringAgentPaymentTypes: [
      {
        agentID: {
          type: String,
          trim: true,
        },
        agentPaymentType: {
          type: String,
          trim: true,
        },
        ACHAccountNumber: {
          type: String,
          trim: true,
        },
        ACHAccountBankRoutingNumber: {
          type: String,
          trim: true,
        },
        status: {
          type: String,
          trim: true,
        },
      },
    ],
    paymentsTotal: {
      type: Number,
      required: true,
    },
    deductionItems: [
      {
        deductionType: {
          type: String,
          required: true,
          trim: true,
        },
        agentID: {
          type: String,
          trim: true,
        },
        agentName: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    deductionsTotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    agentNotes: {
      type: String,
      trim: true,
    },
    agencyDisclosureForm: {
      type: String,
      required: true,
    },
    contractOrLeaseForms: {
      type: [String],
    },
    agentPaymentType: {
      type: String,
      required: true,
    },
    fundsPaidBy: {
      type: String,
      required: true,
    },
    ACHAccountNumber: {
      type: String,
      trim: true,
    },
    ACHAccountBankRoutingNumber: {
      type: String,
      trim: true,
    },
    alreadyTurnedFundsIn: {
      type: String,
      required: true,
    },
    shouldSendApprovalTextMessageNotification: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
    },
    acceptedAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
    },
    bonusPercentageAddedByAdmin: {
      type: Number,
      default: 0,
    },
    netAgentCommission: {
      type: Number,
    },
    netCompanyCommission: {
      type: Number,
    },
    isCoAgent: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

dealSchema.pre('save', function dealPreSave(next) {
  const bonusPercentageAddedByAdmin = this.bonusPercentageAddedByAdmin || 0;
  const agentReceivedPercentage =
    (this.agentType + bonusPercentageAddedByAdmin) / 100;

  const netAgentCommission = this.total * agentReceivedPercentage;

  this.netAgentCommission = round(netAgentCommission, 2);
  this.netCompanyCommission = round(this.total - netAgentCommission, 2);
  next();
});

dealSchema.post('save', (error, doc, next) => {
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
    throw new CustomError('Normal', 'That dealID has already been registered.');
  }
  if (error) throw new Error(error);
  next();
});

async function findByDealID(dealID, userId, currentUser, isInteranl) {
  const dealPromise = this.findOne({ dealID }).exec();
  const userPromise = User.findByUUID(userId);
  const [deal, user] = await Promise.all([dealPromise, userPromise]);
  return buildCoAgentDeal(deal, user, currentUser, isInteranl);
}

async function findByAgentID(agentID, currentUser) {
  const userPromise = User.findByUUID(agentID);
  const leadDealsPromise = this.find({ agentID }).exec();
  const coAgentDealsPromise = this.find({ 'deductionItems.agentID': agentID }).exec();
  const [
    leadDealsRaw,
    coAgentDealsRaw,
    user,
  ] = await Promise.all([leadDealsPromise, coAgentDealsPromise, userPromise]);
  const leadDeals = await Promise.all(buildLeadDeals(leadDealsRaw));
  const coAgentDeals = await Promise.all(buildCoAgentDeals(coAgentDealsRaw, agentID, user, currentUser));
  return [...leadDeals, ...coAgentDeals];
}

async function findByAgentName(agentName) {
  const deals = await this.find({
    agentName: new RegExp(agentName, 'i'),
  }).exec();
  return deals;
}

async function findByClientName(clientName) {
  const deals = await this.find({
    clientName: new RegExp(clientName, 'i'),
  }).exec();
  return deals;
}

async function findByAgentRealEstateLicenseNumber(
  agentRealEstateLicenseNumber
) {
  const deals = await this.find({ agentRealEstateLicenseNumber }).exec();
  return deals;
}

async function findByDateRange(startDate, endDate) {
  const momentStartDate = moment(startDate);
  const momentEndDate = moment(endDate);

  if (!momentStartDate || !momentEndDate) return [];

  if (momentStartDate.isAfter(momentEndDate)) return [];

  const nativeStartDate = momentStartDate.toDate();
  const nativeEndDate = momentEndDate.toDate();

  console.log(nativeStartDate);
  console.log(nativeEndDate);

  const deals = await this.find({
    date: {
      $gte: nativeStartDate,
      $lte: nativeEndDate,
    },
  }).exec();

  return deals;
}

dealSchema.static('findByDealID', findByDealID);

dealSchema.static('findByAgentID', findByAgentID);

dealSchema.static('findByAgentName', findByAgentName);

dealSchema.static(
  'findByAgentRealEstateLicenseNumber',
  findByAgentRealEstateLicenseNumber
);

dealSchema.static('findByClientName', findByClientName);

dealSchema.static('findByDateRange', findByDateRange);

module.exports = dealSchema;
