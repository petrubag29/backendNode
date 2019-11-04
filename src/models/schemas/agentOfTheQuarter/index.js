const mongoose = require('mongoose');
const moment = require('moment');
const CustomError = require('../../../utils/CustomError');
const { setValue, get } = require('../../../utils/objectUtils');
const User = require('../../User');
const Deal = require('../../Deal');
const { agent: agentRole } = require('../../../constants/userTypes');

const agentOfTheQuarterSchema = mongoose.Schema({
  type: {
    type: String,
    required: true,
    index: { unique: true },
  },
  name: {
    type: String,

  },
  uuid: {
    type: String,

  },
  photoURL: {
    type: String,
  },
  statItem: {
    type: Number,
    required: true,
  },
});

agentOfTheQuarterSchema.post('save', (error, doc, next) => {
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

async function setAgentOfTheQuarter() {
  console.log('running agent of the month...');
  const possibleAgents = {};
  const intDeals = await Deal.find({ status: 'approved' }).exec();
  const now = moment();
  const currentQuarter = now.quarter()-1;
  const currentYear = now.year();
  const deals = intDeals.filter(
    deal =>
      moment(deal.date).quarter() === currentQuarter &&
      moment(deal.date).year() === currentYear
  );
  const agents = await User.find({ role: agentRole }).exec();
  const agentsByUUID = {};
  const agentUUIDs = agents.map(agent => agent.uuid);

  const thisRef = this;

  agents.forEach(agent => {
    agentsByUUID[agent.uuid] = agent;
  });

  let residentialSalesAgent = {
    type: 'residentialDollarsAgent',
    statItem: 0,
    uuid: null,
    photoURL: null,
  };
  let commercialSalesAgent = {
    type: 'commercialSalesAgent',
    statItem: 0,
    uuid: null,
    name: null,
    photoURL: null,
  };
  let rentalsAgent = {
    type: 'rentalsAgent',
    statItem: 0,
    uuid: null,
    name: null,
    photoURL: null,
  };
  let numOfDealsAgent = {
    type: 'numOfDeals',
    statItem: 0,
    uuid: null,
    name: null,
    photoURL: null,
  };

  await deals.forEach( deal => {
    const isSale = /sale/i.test(deal.dealType);
    const isResidential = /residential/i.test(deal.dealType);
    let type;

    if (!agentUUIDs.includes(deal.agentID)) return;

    if (isResidential && isSale) {
      type = 'residentialSales';
    } else if (isSale) {
      type = 'commercialSales';
    } else {
      type = 'rentals';
    }

    const previousDollarsVal = get([deal.agentID, type], possibleAgents) || 0;
    const previousNumOfDeals =
      get([deal.agentID, 'numOfDeals'], possibleAgents) || 0;

    setValue(
      possibleAgents,
      `${deal.agentID}.${type}`,
      previousDollarsVal + deal.total
    );

    setValue(
      possibleAgents,
      `${deal.agentID}.numOfDeals`,
      previousNumOfDeals + 1
    );
  });

  await Object.keys(possibleAgents).forEach(agentUUID => {
    const agentItem = possibleAgents[agentUUID];

    if (residentialSalesAgent.statItem < (agentItem.residentialSales || 0)) {
      residentialSalesAgent = {
        type: 'residentialDollarsAgent',
        statItem: agentItem.residentialSales,
        uuid: agentUUID,
      };
    }

    if (commercialSalesAgent.statItem < (agentItem.commercialSales || 0)) {
      commercialSalesAgent = {
        type: 'commercialSalesAgent',
        statItem: agentItem.commercialSales,
        uuid: agentUUID,
      };
    }

    if (rentalsAgent.statItem < (agentItem.rentals || 0)) {
      rentalsAgent = {
        type: 'rentalsAgent',
        statItem: agentItem.rentals,
        uuid: agentUUID,
      };
    }

    if (numOfDealsAgent.statItem < (agentItem.numOfDeals || 0)) {
      numOfDealsAgent = {
        type: 'numOfDealsAgent',
        statItem: agentItem.numOfDeals,
        uuid: agentUUID,
      };
    }
  });
  const docs = [
    residentialSalesAgent,
    commercialSalesAgent,
    rentalsAgent,
    numOfDealsAgent,
  ];

  await docs.forEach(agentOfTheQuarterItem => {
    if (agentOfTheQuarterItem.uuid) {
      agentOfTheQuarterItem.photoURL =
        agentsByUUID[agentOfTheQuarterItem.uuid].agent.profilePicURL;
      agentOfTheQuarterItem.name =
        agentsByUUID[agentOfTheQuarterItem.uuid].fullName;
    }
    thisRef
      .findOneAndUpdate({ type: agentOfTheQuarterItem.type }, agentOfTheQuarterItem, {
        upsert: true,
        runValidators: true,
        overwrite: true,
      })
      .exec();
  });

  console.log('finished running agent of the month...');
}

agentOfTheQuarterSchema.static('setAgentOfTheQuarter', setAgentOfTheQuarter);

module.exports = agentOfTheQuarterSchema;
