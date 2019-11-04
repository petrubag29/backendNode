const mongoose = require('mongoose');
const databaseInit = require('./databaseDataInit');

// mongoose.connect(process.env.MONGODB_URI);
mongoose.connect('mongodb://127.0.0.1:27017/databaseDataInit')
const db = mongoose.connection;

db.on('error', error => {
  console.error.bind(console, `connection error: ${error}`);
});
db.once('open', () => {
  console.log('Connected to mongodb server');
  databaseInit();
});
