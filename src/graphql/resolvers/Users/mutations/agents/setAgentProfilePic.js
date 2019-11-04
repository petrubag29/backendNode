const User = require('../../../../../models/User');
const cleanUserInput = require('../../../../../utils/cleanUserInput');
const { logger } = require('../../../../../utils/logger');
const {
  agent: agentRole,
  admin,
  superAdmin,
} = require('../../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');
const deleteUploaded3Files = require('../../../../../services/aws/s3/deleteFile');

const acceptedFilesRegex = new RegExp(/.jpg$|.jpeg$/i);

async function setAgentProfilePic(obj, args, context, info) {
  const { currentUser, res, req } = context;

  if (
    !currentUser ||
    (currentUser.role !== admin && currentUser.role !== superAdmin)
  ) {
    throwUnautorizedAccessError(req, info);
  }

  const { agentID, fileName } = cleanUserInput(args.input);

  const url = `https://${
    process.env.AWS_S3_BUCKET_NAME
  }.s3.amazonaws.com/users/agents/${agentID}/profilePic/${fileName}`;

  const returnObj = {
    url: null,
    wasSuccessful: false,
    otherError: null,
    userErrors: [],
  };

  if (!acceptedFilesRegex.test(fileName)) {
    returnObj.userErrors.push({
      field: 'imageFile',
      message:
        "Image file type not accepted. Must be either 'jpg' or 'jpeg' format!",
    });

    return returnObj;
  }

  let agent;

  try {
    agent = await User.findByUUID(agentID);
  } catch (err) {
    logger.log('error', err);
    returnObj.otherError = err;
    return returnObj;
  }

  if (!agent) {
    returnObj.otherError =
      'The agent that you are attempting to edit cannot be found!';
    return returnObj;
  }

  if (agent.agent.profilePicURL) {
    const { profilePicURL } = agent.agent;

    const profilePicFileName = profilePicURL.split('/').pop();

    const profilePicturePathPath = `users/agents/${agentID}/profilePic/${profilePicFileName}`;

    const response = await deleteUploaded3Files(
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

  try {
    await User.update(
      { uuid: agentID },
      { $set: { 'agent.profilePicURL': url } }
    );
  } catch (err) {
    logger.log('error', err);
    return returnObj;
  }

  if (!returnObj.otherError) {
    returnObj.url = url;
    returnObj.wasSuccessful = true;
  }

  return returnObj;
}

module.exports = setAgentProfilePic;
