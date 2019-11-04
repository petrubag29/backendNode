const schedule = require('node-schedule');
const MBackup = require('s3-mongo-backup');
const { logger } = require('../../utils/logger');
const MongoDBBackupURIList = require('../../models/MongoDBBackupURIList');
const deleteAWSBackup = require('../aws/s3/deleteMongoDBDatabaseBackup');

const backupConfig = {
  mongodb: process.env.MONGODB_URI, // MongoDB Connection URI
  s3: {
    accessKey: process.env.AWS_ACCESS_KEY_ID, //AccessKey
    secretKey: process.env.AWS_SECRET_ACCESS_KEY, //SecretKey
    region: process.env.AWS_REGION, //S3 Bucket Region
    accessPerm: 'private', //S3 Bucket Privacy, Since, You'll be storing Database, Private is HIGHLY Recommended
    bucketName: process.env.AWS_MONGODB_BACKUP_BUCKET_NAME, //Bucket Name
  },
  keepLocalBackups: true, //If true, It'll create a folder in project root with database's name and store backups in it and if it's false, It'll use temporary directory of OS
  noOfLocalBackups: 7, //This will only keep the most recent 5 backups and delete all older backups from local backup directory
  timezoneOffset: -4, //Timezone, It is assumed to be in hours if less than 16 and in minutes otherwise
};

const checkBackupsFull = async () => {
  const backupURIListItem = await MongoDBBackupURIList.findOne({}).exec();

  const backupURIList = backupURIListItem ? backupURIListItem.UIRList : [];

  const returnObj = {
    isFull: false,
    URI: null,
    backupURIListItem:
      backupURIListItem || new MongoDBBackupURIList({ UIRList: [] }),
    backupURIList,
  };

  if (backupURIList.length >= 7) {
    returnObj.isFull = true;
    returnObj.URI = returnObj.backupURIList.pop();
  }

  return returnObj;
};

const j = schedule.scheduleJob(
  { hour: 23, minute: 0, dayOfWeek: [0, 3] },
  async () => {
    try {
      const {
        isFull,
        URI,
        backupURIListItem,
        backupURIList,
      } = await checkBackupsFull();

      console.log('AWS backup started...');
      const result = await MBackup({ ...backupConfig });
      console.log('AWS backup created');

      if (!result.error) {
        if (isFull) {
          await deleteAWSBackup([{ Key: URI }]);
        }

        backupURIListItem.UIRList = [result.data.key, ...backupURIList];
        await backupURIListItem.save();
      }

      if (result.error) logger.log('error', result.error);
    } catch (err) {
      logger.log('error', err);
    }
  }
);

/*
setInterval(async () => {
  try {
    const {
      isFull,
      URI,
      backupURIListItem,
      backupURIList,
    } = await checkBackupsFull();

    console.log('AWS backup started...');
    const result = await MBackup({ ...backupConfig });
    console.log('AWS backup created');

    if (!result.error) {
      if (isFull) {
        await deleteAWSBackup([{ Key: URI }]);
      }

      backupURIListItem.UIRList = [result.data.key, ...backupURIList];
      await backupURIListItem.save();
    }

    if (result.error) logger.log('error', result.error);
  } catch (err) {
    logger.log('error', err);
  }
}, 10000);
*/
