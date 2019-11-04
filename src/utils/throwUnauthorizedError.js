const { logger } = require('../utils/logger');

function throwUnautorizedAccessError(req, { path: graphQLPath }) {
  if (graphQLPath) {
    graphQLPath = JSON.stringify(graphQLPath);
  }
  const ip = req.clientIp;
  const ipPart = `${req ? `IP Address: ${ip}` : null}`;
  const gqlPart = `${graphQLPath ? `GraphQL Path: ${graphQLPath}` : null}`;
  const logMessage = `Unauthorized data request. ${ipPart}, ${gqlPart}`;

  logger.log('warn', logMessage);
  throw new Error('Access Denied');
}

module.exports = throwUnautorizedAccessError;
