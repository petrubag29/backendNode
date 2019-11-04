const cleanUserInput = require('../../../../utils/cleanUserInput');
const generateRandomID = require('../../../../utils/idGenerator');
const { agent } = require('../../../../constants/userTypes');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const getSignedURLS = require('../../../../services/aws/s3/getSignedURLS');

const acceptedFilesRegex = new RegExp(/.(jpg)$|.(jpeg)$|.(pdf)$/, 'i');

const getDealFileUploadsSignedURLS = async (obj, args, context, info) => {
  const { currentUser, req } = context;
  let dealID = generateRandomID();

  console.log('args', args);

  if (args.input.dealID) {
    // eslint-disable-next-line prefer-destructuring
    dealID = args.input.dealID;
  }

  const returnObj = {
    dealID,
    items: null,
    error: null,
  };

  if (!currentUser || currentUser.role !== agent) {
    throwUnautorizedAccessError(req, info);
  }

  const items = args.input.items.map(item => {
    const { fileName } = cleanUserInput(item);

    const url =
      item.itemName === 'agencyDisclosureForm'
        ? `deals/${dealID}/agencyDisclosureForm/${fileName}`
        : `deals/${dealID}/contractOrLeaseForms/${fileName}`;

    return {
      itemName: item.itemName,
      fileType: item.fileType,
      uploadFilePath: url,
      fileName,
      expires: 300,
    };
  });

  items.forEach(item => {
    if (!acceptedFilesRegex.test(item.fileName)) {
      returnObj.error =
        'These file uploads must be in either PDF, JPG, or JPEG format!';
    }
  });

  returnObj.items = await getSignedURLS(items);

  return returnObj;
};

module.exports = getDealFileUploadsSignedURLS;
