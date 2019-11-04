const {
  agent: agentRole,
  admin,
  superAdmin,
} = require('../../../../../constants/userTypes');
const User = require('../../../../../models/User');
const InvalidJWTItem = require('../../../../../models/InvalidJWTItem');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../../utils/logger');

const deleteUploaded3Files = require('../../../../../services/aws/s3/deleteFile');

const deleteAgent = async (obj, args, context, info) => {
  const { currentUser, res, req } = context;

  const returnObj = {
    error: null,
  };

  if (
    !currentUser ||
    (currentUser.role !== admin && currentUser.role !== superAdmin)
  ) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid } = args;

  let agent;

  try {
    agent = await User.findByUUID(uuid);
  } catch (err) {
    logger.log('error', err);
    returnObj.error = err;
    return returnObj;
  }

  if (!agent) {
    returnObj.error =
      'The agent that you are attempting to delete cannot be found!';
    return returnObj;
  }

  const { profilePicURL } = agent.agent;

  let response;

  if (profilePicURL) {
    const profilePicFileName = profilePicURL.split('/').pop();

    const profilePicturePathPath = `users/agents/${uuid}/profilePic/${profilePicFileName}`;

    response = await deleteUploaded3Files(
      [profilePicturePathPath].map(path => ({
        Key: path,
      }))
    );

    console.log(response);

    if (response.error) {
      console.log(response.error);
      returnObj.error =
        'There was an error deleting your uploaded files for this agent.';
      return returnObj;
    }
  }

  if (agent.lastJWTTokenReceived) {
    const newInvalidJWTItem = new InvalidJWTItem({
      JWT: agent.lastJWTTokenReceived,
    });

    try {
      await newInvalidJWTItem.save();
    } catch (err) {
      logger.log('error', err);
      returnObj.error = 'There was an error deleting the agent!';
      return returnObj;
    }
  }

  try {
    await User.deleteOne({ uuid: agent.uuid });
  } catch (err) {
    logger.log('error', err);
    returnObj.error = 'There was an error deleting the agent!';
    return returnObj;
  }

  return returnObj;
};

module.exports = deleteAgent;
