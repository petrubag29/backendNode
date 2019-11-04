const router = require('express').Router();
const asyncMiddleware = require('../utils/asyncMiddleWareWrapper');
const { logoutUser, loginUser } = require('../customMiddleware/authorization');
const { loginRateLimiter } = require('../customMiddleware/RateLimiter');

if (process.env.NODE_ENV === 'production') {
  router.post('/', loginRateLimiter, asyncMiddleware(loginUser));
} else {
  router.post('/', asyncMiddleware(loginUser));
}

router.delete('/', asyncMiddleware(logoutUser));

module.exports = router;
