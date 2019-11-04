const winston = require('winston');
const onHeaders = require('on-headers');

const { format } = winston;
const { combine, timestamp, label, printf } = format;

const myFormat = printf(
  info =>
    `\nTime: ${info.timestamp}, Label: ${info.label}, Level: ${info.level}: ${
      info.message
    }`
);

const simpleLogger = winston.createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.Console(),
  ],
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(label({ label: 'log' }), timestamp(), myFormat),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '.logs/combined.log',
      maxsize: '10000000',
    }),
    new winston.transports.File({
      filename: '.logs/error.log',
      level: 'error',
      maxsize: '10000000',
    }),
    new winston.transports.File({
      filename: '.logs/warning.log',
      level: 'warn',
      maxsize: '10000000',
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: '.logs/exceptions.log',
      maxsize: '10000000',
    }),
  ],
});

function logResponse(startAt) {
  // 'this' is the response object
  const diff = process.hrtime(startAt);
  const time = Math.round(diff[0] * 1e3 + diff[1] * 1e-6);
  logger.info(`
    Type: Response
    Request Status: ${this.statusCode}
    Content-Type: ${this.get('Content-Type')}
    Response Time: ${time}ms
  `);
}

const loggerMiddleware = (req, res, next) => {
  const startAt = process.hrtime();
  logger.info(`
  Type: Request
  From: ${req.ip}
  Method: ${req.method}
  Protocol: ${req.protocol}
  Path Requested: ${req.path}
  XHR: ${req.xhr}
  headers: ${JSON.stringify(req.headers)}
  `);
  const responseLogger = logResponse.bind(res, startAt);
  onHeaders(res, responseLogger);
  next();
};

exports.requestResponseLogger = loggerMiddleware;

exports.simpleLogger = simpleLogger;

exports.logger = logger;
