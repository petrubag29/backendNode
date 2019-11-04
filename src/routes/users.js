const router = require('express').Router();
const asyncMiddleware = require('../utils/asyncMiddleWareWrapper');
const { registerUserHandler } = require('../customMiddleware/authorization');
// const { registerRateLimiter } = require('../utils/RateLimiter');

// rate limit
// router.use(registerRateLimiter);

// register user
router.post('/', asyncMiddleware(registerUserHandler));

module.exports = router;
