const cleanUserInput = require('../../../../../utils/cleanUserInput');
const {
  admin,
  superAdmin,
} = require('../../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../../utils/throwUnauthorizedError');
const getSignedURLS = require('../../../../../services/aws/s3/getSignedURLS');

const acceptedFilesRegex = new RegExp(/.(jpg)$|.(jpeg)$/i);

const getProfilePicSignedURL = async (obj, args, context, info) => {
  const { currentUser, req } = context;

  const returnObj = {
    item: null,
    error: null,
  };

  if (
    !currentUser ||
    (currentUser.role !== admin && currentUser.role !== superAdmin)
  ) {
    throwUnautorizedAccessError(req, info);
  }

  const { fileName, fileType, uuid: agentID } = cleanUserInput(args.input);

  const item = [
    {
      fileName,
      fileType,
      uploadFilePath: `users/agents/${agentID}/profilePic/${fileName}`,
    },
  ];

  item.forEach(v => {
    if (!acceptedFilesRegex.test(v.fileName)) {
      returnObj.error =
        "These file uploads must be in either 'jpg', or 'jpeg' format!";
    }
  });

  returnObj.item = await getSignedURLS(item);

  return returnObj;
};

module.exports = getProfilePicSignedURL;
