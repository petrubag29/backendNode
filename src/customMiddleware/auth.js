const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logger } = require('../utils/logger');
const InvalidJWTItem = require('../models/InvalidJWTItem');

const clearInvalidJWT = res => {
  res.clearCookie('jwtData', {
    sameSite: true,
  });
  res.clearCookie('jwtSignature', {
    httpOnly: true,
    sameSite: true,
  });
};

function authenticateMiddleware(req, res, next) {
  const { jwtData, jwtSignature } = req.cookies;
  if (!jwtData || !jwtSignature) {
    next();
    return;
  }
  const fullJwt = `${jwtData}.${jwtSignature}`;

  jwt.verify(
    fullJwt,
    process.env.SECRET,
    { ignoreExpiration: false },
    async (err, decodedPayload) => {
      if (err) {
        clearInvalidJWT(res);
        res.redirect(401, '/');
        return;
      }

      try {
        const invalidJWT = await InvalidJWTItem.findOne({
          JWT: fullJwt,
        }).exec();
        if (invalidJWT) {
          clearInvalidJWT(res);
          res.redirect(401, '/');
          return;
        }
      } catch (error) {
        logger.log('error', err);
        next(error);
        return;
      }

      const user = await User.findByUUID(decodedPayload.uuid);

      req.user = user;
      next();
    }
  );
}

module.exports = authenticateMiddleware;
