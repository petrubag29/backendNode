const AWS = require('aws-sdk');

const { logger } = require('../../../utils/logger');

/*
  getSignedURLS: Parameter
    [
      {
        itemName: String!
        uploadFilePath: String!
        fileType: String!
        expires: Number
      },
    ]

  getSignedURLS: Return (initially returns an array of promises)
    [
      {
        itemName: String!
        signedURL: String
        error: Error | null!
      },
    ]

  getSignedURL: Return
    {
      itemName: String!
      signedURL: String
      error: Error | null!
    }
*/

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const getSignedURLS = itemsToGetURLFor =>
  Promise.all(itemsToGetURLFor.map(getSignedURL));

const getSignedURL = async ({
  itemName,
  uploadFilePath,
  fileType,
  expires,
  uuid,
  fileName,
}) => {
  const returnObj = {
    itemName,
    fileName,
    uuid,
    signedURL: '',
    error: null,
  };

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: uploadFilePath,
    ContentType: fileType,
    ACL: 'public-read',
    Expires: expires || 60,
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
        logger('error', err);
        reject(err);
      }
    });

  try {
    returnObj.signedURL = await getSignedURLPromise();
  } catch (err) {
    returnObj.error = `${itemName}:
    ${JSON.stringify(err)}
    `;
  }

  return returnObj;
};

module.exports = getSignedURLS;
