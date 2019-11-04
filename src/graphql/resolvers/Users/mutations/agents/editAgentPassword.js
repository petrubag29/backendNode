const User = require('../../../../../models/User');
const { logger } = require('../../../../../utils/logger');
const {
  agent: agentRole,
  admin,
  superAdmin,
} = require('../../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');

async function editAgentPassword(obj, args, context, info) {
  const { currentUser, res, req } = context;

  const { uuid, newPassword } = args.input;

  if (
    !currentUser ||
    (currentUser.role !== admin &&
      currentUser.role !== superAdmin &&
      currentUser.role !== agentRole)
  ) {
    throwUnautorizedAccessError(req, info);
  }

  if (currentUser.role === agentRole && currentUser.uuid !== uuid) {
    throwUnautorizedAccessError(req, info);
  }

  const editAgentPasswordReturn = {
    userErrors: [],
    otherError: null,
  };

  let agent;

  // TODO: perform server-side validations on user inputs

  try {
    agent = await User.findByUUID(uuid);
  } catch (err) {
    editAgentPasswordReturn.error = err;
    logger.log('error', err);
    return editAgentPasswordReturn;
  }

  if (!agent) {
    editAgentPasswordReturn.error =
      'The agent that you are attmpting to edit cannot be found.';
    return editAgentPasswordReturn;
  }

  try {
    await agent.set({ password: newPassword }).save();
  } catch (err) {
    if (err.custom && err.type === 'Normal') {
      if (err.errors) {
        console.log(err);
        Object.keys(err.errors).forEach(key => {
          editAgentPasswordReturn.userErrors.push({
            field: key,
            message: err.errors[key],
          });
        });
      }
      return editAgentPasswordReturn;
    }
    editAgentPasswordReturn.otherError = err;
    logger.log('error', err);
    return editAgentPasswordReturn;
  }

  console.log(editAgentPasswordReturn);

  return editAgentPasswordReturn;
}

module.exports = editAgentPassword;
