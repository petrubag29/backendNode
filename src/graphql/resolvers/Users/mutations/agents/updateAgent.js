const User = require('../../../../../models/User');
const cleanUserInput = require('../../../../../utils/cleanUserInput');
const { logger } = require('../../../../../utils/logger');
const { capitalize } = require('../../../../../utils/stringUtils');
const {
  agent: agentRole,
  admin,
  superAdmin,
} = require('../../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');
const objectToDotNotation = require('../../../../../utils/updateMongoDocWithNestedFields');

// AWS.config.update({ branch: 'ap-northeast-1' });

async function updateAgent(obj, args, context, info) {
  const { currentUser, res, req } = context;

  if (
    !currentUser ||
    (currentUser.role !== admin &&
      currentUser.role !== superAdmin &&
      currentUser.role !== agentRole)
  ) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid } = args.input;

  const {
    firstName,
    lastName,
    email,
    agentType,
    realEstateLicenseNumber,
    officeNumber,
    mobileNumber,
    areaOfFocus,
    branch,
    state,
    ACHAccountNumber,
    ACHAccountBankRoutingNumber,
    title,
    facebook,
    twitter,
    instagram,
    profileDescription,
  } = cleanUserInput(args.input);

  const updateAgentReturn = {
    agent: null,
    wasSuccessful: false,
    userErrors: [],
    otherError: null,
  };

  // TODO: perform server-side validations on user inputs

  const isAdmin = currentUser.role === admin || currentUser.role === superAdmin;

  let userChanges;

  if (isAdmin) {
    userChanges = objectToDotNotation({
      firstName: capitalize(firstName),
      lastName: capitalize(lastName),
      email,
      agent: {
        agentType,
        realEstateLicenseNumber,
        officeNumber,
        mobileNumber,
        areaOfFocus,
        state,
        branch,
        ACHAccountNumber,
        ACHAccountBankRoutingNumber,
        title,
        facebook: facebook ? `https://www.facebook.com/${facebook}` : undefined,
        twitter: twitter ? `https://www.twitter.com/${twitter}` : undefined,
        instagram: instagram
          ? `https://www.instagram.com/${instagram}`
          : undefined,
        profileDescription,
      },
    });
  } else {
    userChanges = objectToDotNotation({
      agent: {
        areaOfFocus,
        mobileNumber,
        ACHAccountNumber,
        ACHAccountBankRoutingNumber,
        facebook: facebook ? `https://www.facebook.com/${facebook}` : undefined,
        twitter: twitter ? `https://www.twitter.com/${twitter}` : undefined,
        instagram: instagram
          ? `https://www.instagram.com/${instagram}`
          : undefined,
        profileDescription,
      },
    });
  }

  let agent;

  // TODO: perform server-side validations on user inputs

  try {
    agent = await User.findByUUID(uuid);
  } catch (err) {
    updateAgentReturn.error = err;
    logger.log('error', err);
    return updateAgentReturn;
  }

  if (!agent) {
    updateAgentReturn.otherError =
      'The agent that you are attmpting to edit cannot be found.';
    return updateAgentReturn;
  }

  console.log(userChanges);

  try {
    agent = await User.findOneAndUpdate(
      { uuid },
      { $set: { ...userChanges } },
      { new: true }
    );
    updateAgentReturn.agent = agent;
  } catch (err) {
    if (err.custom && err.type === 'Normal') {
      if (err.errors) {
        Object.keys(err.errors).forEach(key => {
          updateAgentReturn.userErrors.push({
            field: key,
            message: err.errors[key],
          });
        });
      } else {
        updateAgentReturn.userErrors.push({
          field: 'email',
          message: 'That email has already been registered.',
        });
      }
      return updateAgentReturn;
    }
    logger.log('error', err);
    throw err;
  }

  if (!updateAgentReturn.userErrors.length) {
    updateAgentReturn.wasSuccessful = true;
  }

  console.log(updateAgentReturn);

  return updateAgentReturn;
}

module.exports = updateAgent;
