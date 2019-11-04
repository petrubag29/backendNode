const AWS = require('aws-sdk');

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

const deleteFiles = async s3Paths => {
  const returnObj = {
    response: null,
    error: null,
  };

  const params = {
    Bucket: process.env.AWS_MONGODB_BACKUP_BUCKET_NAME,
    Delete: {
      /* required */
      Objects: s3Paths,
      Quiet: true,
    },
  };

  const deleteFileObjects = () =>
    new Promise((resolve, reject) => {
      try {
        s3.deleteObjects(params, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        });
      } catch (err) {
        reject(err);
      }
    });

  returnObj.response = await deleteFileObjects();

  return returnObj;
};

module.exports = deleteFiles;
