const User = require('../../../../../models/User');
const { logger } = require('../../../../../utils/logger');
const {
  returnViewableUserFields,
  returnAllUsersViewableFields,
} = require('../../../../../models/userRepository');

module.exports = {
  agents: async (obj, args, context) => {
    const { currentUser } = context;
    let agents;
    try {
      agents = await User.find({ role: 'agent' }).exec();
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }
    return returnAllUsersViewableFields(currentUser, agents);
  },
  agent: async (obj, args, context) => {
    const { uuid } = args;
    const { currentUser, req } = context;
    let agent;

    console.log(`currentUser: ${currentUser}`);

    try {
      agent = await User.findByUUID(uuid);
    } catch (err) {
      logger.log('error', JSON.stringify(err));
      throw err;
    }

    if (agent) {
      console.log(agent);
      return returnViewableUserFields(currentUser, agent);
    }

    if (!agent) return null;
  },
};
