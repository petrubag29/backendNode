const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logger } = require('../utils/logger');

const decode = token =>
  new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.SECRET,
      { ignoreExpiration: false },
      async (err, decodedPayload) => {
        const returnObj = {
          error: null,
          decodedPayload: null,
        };

        if (err) {
          returnObj.error = 'JWT invalid';
        } else {
          returnObj.decodedPayload = decodedPayload;
        }

        resolve(returnObj);
      }
    );
  });

module.exports = decode;
