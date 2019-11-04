const AWS = require('aws-sdk');
const generateRandomID = require('../../../../../utils/idGenerator');
const User = require('../../../../../models/User');
const cleanUserInput = require('../../../../../utils/cleanUserInput');
const { logger } = require('../../../../../utils/logger');
const {
  agent: agentRole,
  admin,
  superAdmin,
} = require('../../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');
const { capitalize } = require('../../../../../utils/stringUtils');

// AWS.config.update({ branch: 'ap-northeast-1' });

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const getSignedURL = async ({ agentID, fileName, imageType }) => {
  const uploadFilePath = `users/agents/${agentID}/profilePic/${fileName}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: uploadFilePath,
    // Acl: 'public-read',
    ContentType: imageType,
    ACL: 'public-read',
    Expires: 60,
  };

  const getSignedURLPromise = () =>
    new Promise((resolve, reject) => {
      try {
        s3.getSignedUrl('putObject', params, (err, url) => {
          if (err) {
            reject(err);
          }
          resolve(url);
        });
      } catch (err) {
        logger.log('error', err);
        reject(err);
      }
    });

  const signedURL = await getSignedURLPromise();

  return signedURL;
};

const acceptedFilesRegex = new RegExp(/.(jpg)$|.(jpeg)$/i);

async function createAgent(obj, args, context, info) {
  const { currentUser, res, req } = context;

  if (
    !currentUser ||
    (currentUser.role !== admin && currentUser.role !== superAdmin)
  ) {
    throwUnautorizedAccessError(req, info);
  }

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
    temporaryPassword,
    fileName,
    fileType,
    ACHAccountNumber,
    ACHAccountBankRoutingNumber,
    title,
    facebook,
    twitter,
    instagram,
    profileDescription,
  } = cleanUserInput(args.input);

  let agent;

  const createAgentReturn = {
    agent: null,
    signedURL: null,
    wasSuccessful: false,
    userErrors: [],
    otherError: null,
  };

  if (fileName && !acceptedFilesRegex.test(fileName)) {
    createAgentReturn.userErrors.push({
      field: 'imageFile',
      message:
        "Image file type not accepted. Must be either 'jpg' or 'jpeg' format!",
    });

    return createAgentReturn;
  }

  // TODO: perform server-side validations on user inputs

  let signedURL;
  const uuid = generateRandomID();

  const newUser = new User({
    uuid,
    firstName: capitalize(firstName),
    lastName: capitalize(lastName),
    email,
    role: agentRole,
    password: temporaryPassword,
    createdAt: new Date(),
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
      createdByID: currentUser.uuid,
      createdByName: capitalize(
        `${currentUser.firstName} ${currentUser.lastName}`
      ),
    },
  });

  try {
    agent = await newUser.save();
    createAgentReturn.agent = agent;
  } catch (err) {
    if (err.custom && err.type === 'Normal') {
      if (err.errors) {
        console.log(err);
        Object.keys(err.errors).forEach(key => {
          createAgentReturn.userErrors.push({
            field: key,
            message: err.errors[key],
          });
        });
      } else {
        createAgentReturn.userErrors.push({
          field: 'email',
          message: 'That email has already been registered.',
        });
      }
      return createAgentReturn;
    }
    logger.log('error', err);
    throw err;
  }

  if (fileName) {
    try {
      signedURL = await getSignedURL({
        agentID: uuid,
        fileName,
        imageType: fileType,
      });
      createAgentReturn.signedURL = signedURL;
    } catch (err) {
      logger.log('error', err);
      createAgentReturn.otherError = {
        field: 'other',
        message: 'There was a problem in creating the signed URL',
      };
      return createAgentReturn;
    }
  }

  if (!createAgentReturn.userErrors.length) {
    createAgentReturn.wasSuccessful = true;
  }

  console.log(createAgentReturn);

  return createAgentReturn;
}

module.exports = createAgent;
