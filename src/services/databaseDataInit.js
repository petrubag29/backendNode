const FormSelectItem = require('../models/FormSelectItem');
const setupFormSelectItemsCollection = require('../models/collectionsSetup/formSelectItemsCollection');

const User = require('../models/User');
const setupUsersCollection = require('../models/collectionsSetup/usersCollection');

const AgentOfTheQuarter = require('../models/AgentOfTheQuarter');
const setupAgentOfTheQuarterCollection = require('../models/collectionsSetup/agentOfTheQuarterCollection');

const setup = async () => {
  const formSelectItemsExists = !!(await FormSelectItem.db.db
    .listCollections({ name: FormSelectItem.collection.name })
    .toArray()).length;

  const usersExist = !!(await User.db.db
    .listCollections({ name: User.collection.name })
    .toArray()).length;

  const agentOfTheQuarterExist = !!(await AgentOfTheQuarter.db.db
    .listCollections({ name: AgentOfTheQuarter.collection.name })
    .toArray()).length;

  setupUsersCollection(User, usersExist);

  setupAgentOfTheQuarterCollection(AgentOfTheQuarter, agentOfTheQuarterExist);

  setupFormSelectItemsCollection(FormSelectItem, formSelectItemsExists);
};

module.exports = setup;
