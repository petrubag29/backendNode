const { logger } = require('./logger.js');

const clientErrorHandler = (err, req, res, next) => {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' });
  } else {
    next(err);
  }
};

const generalErrorHandler = (err, req, res, next) => {
  logger.log('error', `${err.stack}`);
  res.status(500).send('Something broke!');
};

module.exports = [clientErrorHandler, generalErrorHandler];
