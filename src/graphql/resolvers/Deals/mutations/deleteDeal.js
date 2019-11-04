const {
  agent: agentRole,
  admin,
  superAdmin,
} = require('../../../../constants/userTypes');
const Deal = require('../../../../models/Deal');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');

const deleteUploadeds3Files = require('../../../../services/aws/s3/deleteFile');

const deleteDeal = async (obj, args, context, info) => {
  const { currentUser, req } = context;

  const returnObj = {
    dealID: null,
    error: null,
  };

  if (
    !currentUser ||
    (currentUser.role !== agentRole &&
      currentUser.role !== admin &&
      currentUser.role !== superAdmin)
  ) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid, userUUID } = args;

  let deal;

  try {
    deal = await Deal.findByDealID(uuid, userUUID, currentUser, true);
    if (deal) returnObj.dealID = deal.dealID;
  } catch (err) {
    logger.log('error', err);
    returnObj.error = err;
    return returnObj;
  }

  if (!deal) {
    returnObj.error =
      'The deal that you are attempting to delete has already been deleted.';
    return returnObj;
  } else if (
    currentUser.role === agentRole &&
    deal.agentID !== currentUser.uuid
  ) {
    returnObj.error =
      'You must be the creator of the deal in order to update it.';
    return returnObj;
  } else if (currentUser.role === agentRole && deal.status !== 'pending') {
    returnObj.error = 'Agents may only delete pending deals!';
    return returnObj;
  }

  const { agencyDisclosureForm, contractOrLeaseForms } = deal;

  const agencyDisclosureFormFileName = agencyDisclosureForm.split('/').pop();

  const contractOrLeaseFormsFileNames = contractOrLeaseForms.map(url =>
    url.split('/').pop()
  );

  const agencyDisclosureFormPath = `deals/${
    deal.dealID
  }/agencyDisclosureForm/${agencyDisclosureFormFileName}`;

  const contractOrLeaseFormPaths = contractOrLeaseFormsFileNames.map(
    fileName => `deals/${deal.dealID}/contractOrLeaseForms/${fileName}`
  );

  const response = await deleteUploadeds3Files(
    [agencyDisclosureFormPath, ...contractOrLeaseFormPaths].map(path => ({
      Key: path,
    }))
  );

  console.log(response);

  if (response.error) {
    console.log(response.error);
    returnObj.error =
      'There was an error deleting your uploaded files for this deal.';
    return returnObj;
  }

  try {
    await Deal.deleteOne({ dealID: deal.dealID });
  } catch (err) {
    logger.log('error', err);
    returnObj.error = 'There was an error deleting the deal!';
    return returnObj;
  }

  return returnObj;
};

module.exports = deleteDeal;
