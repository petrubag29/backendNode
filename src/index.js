/* eslint-disable no-console */
require('./config/keys');
require('./services/cron/agentOfTheQuarter');
require('./services/cron/AWSBackup');
const server = require('./app.js');
const { logger } = require('./utils/logger.js');

server.listen(server.get('port'), err => {
  if (err) {
    logger.log('error', `${err.stack}`);
    throw err;
  }
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `Server started on http://${server.get('host')}:${server.get('port')}`
    );
  }
});
