const RateLimit = require('express-rate-limit');

const registerOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message:
    'Too many account creation attempts from this IP, please try again after in 15 minutes',
  handler: registerLimitResponseHandler,
};

function registerLimitResponseHandler(req, res /* next */) {
  res.setHeader('Retry-After', Math.ceil(registerOptions.windowMs / 1000));
  res.format({
    html: () => {
      res.status(registerOptions.statusCode).end(registerOptions.message);
    },
    json: () => {
      res
        .status(registerOptions.statusCode)
        .json({ error: registerOptions.message });
    },
  });
}

const loginOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  delayAfter: 6, // begin slowing down responses after the 6th request
  delayMs: 3 * 1000, // 3 * 1000, // slow down subsequent responses by 3 seconds per request
  message:
    'Too many account creation attempts from this IP, please try again after in 15 minutes',
  handler: loginLimitResponseHandler,
};

function loginLimitResponseHandler(req, res /* next */) {
  res.setHeader('Retry-After', Math.ceil(loginOptions.windowMs / 1000));
  res.format({
    html: () => {
      res.status(loginOptions.statusCode).end(loginOptions.message);
    },
    json: () => {
      res.status(loginOptions.statusCode).json({ error: loginOptions.message });
    },
  });
}

const registerRateLimiter = new RateLimit(registerOptions);

const loginRateLimiter = new RateLimit(loginOptions);

module.exports = {
  registerRateLimiter,
  loginRateLimiter,
};
