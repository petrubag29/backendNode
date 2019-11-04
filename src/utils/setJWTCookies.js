const moment = require('moment');
const createJWT = require('./createJWT');

async function setJWTCookies(configOptions) {
  if (!configOptions.user)
    throw new Error(
      'function "setJWTCookies" must recieve a "user" as an argument'
    );
  if (!configOptions.res)
    throw new Error(
      'function "setJWTCookies" must recieve the current request\'s "res" object as an argument'
    );

  const { res, user, expiration } = configOptions;

  // 7 days in milliseconds
  const sevenDaysLater = moment()
    .add(7, 'days')
    .toDate();
  const time = expiration || sevenDaysLater;
  const { data, signature, token } = await createJWT({ user });
  res.cookie('jwtData', data, {
    expires: time,
    sameSite: true,
  });
  res.cookie('jwtSignature', signature, {
    httpOnly: true,
    sameSite: true,
    expires: time,
  });
  return { data, token };
}

module.exports = setJWTCookies;
