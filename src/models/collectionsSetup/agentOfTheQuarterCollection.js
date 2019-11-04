const { logger } = require('../../utils/logger');

const agentOfTheQuarterCollection = async (Model, agentOfTheQuarterExists) => {
  const residentialSalesAgent = {
    type: 'residentialDollarsAgent',
    statItem: 0,
    uuid: null,
    photoURL: null,
  };
  const commercialSalesAgent = {
    type: 'commercialSalesAgent',
    statItem: 0,
    uuid: null,
    name: null,
    photoURL: null,
  };
  const rentalsAgent = {
    type: 'rentalsAgent',
    statItem: 0,
    uuid: null,
    name: null,
    photoURL: null,
  };
  const numOfDealsAgent = {
    type: 'numOfDeals',
    statItem: 0,
    uuid: null,
    name: null,
    photoURL: null,
  };

  const allItems = [
    residentialSalesAgent,
    commercialSalesAgent,
    rentalsAgent,
    numOfDealsAgent,
  ];

  if (agentOfTheQuarterExists) {
    const docs = await Model.find({}).exec();

    if (docs.length === allItems.length) return;

    try {
      allItems.forEach(agentOfTheQuarterItem => {
        Model.update(
          { type: agentOfTheQuarterItem.type },
          agentOfTheQuarterItem,
          {
            upsert: true,
            runValidators: true,
          }
        ).exec();
      });
    } catch (err) {
      logger.log('error', err);
      throw err;
    }

    return;
  }

  try {
    allItems.forEach(agentOfTheQuarterItem => {
      Model.update(
        { type: agentOfTheQuarterItem.type },
        agentOfTheQuarterItem,
        {
          upsert: true,
          runValidators: true,
        }
      ).exec();
    });
  } catch (err) {
    logger.log('error', err);
    throw err;
  }
};

module.exports = agentOfTheQuarterCollection;
