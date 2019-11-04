const mongoose = require('mongoose');
const mongoDBBackupURIListSchema = require('./schemas/mongoDBBackupURIList');

// create the User model
const MongoDBBackupURIList = mongoose.model(
  'MongoDBBackupURIList',
  mongoDBBackupURIListSchema
);

module.exports = MongoDBBackupURIList;
