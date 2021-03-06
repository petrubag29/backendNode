const CryptoJS = require('crypto-js');
const uuid = require('uuid/v1');
const URLSafeBase64 = require('urlsafe-base64');
const base64url = require('base64url');
const moment = require('moment');

async function createJWT(configOptions) {
  if (
    !configOptions.user ||
    !configOptions.user.role ||
    !configOptions.user.uuid
  ) {
    throw new Error(
      'function "createJWT" must receive a "user" object as an argument which contains a "uuid" a "role" argument'
    );
  }
  const { user, daysToExpiration, audience } = configOptions;

  const newMoment = moment();
  const date = newMoment.toDate();
  // 7 days in milliseconds
  const sevenDaysLater = newMoment.add(daysToExpiration || 7, 'days').toDate();

  const jwtHeader = JSON.stringify({
    typ: 'JWT',
    alg: 'HS256',
    exp: sevenDaysLater,
    aud: audience || undefined,
    iat: date,
    jti: uuid(),
  });

  const jwtPayload = JSON.stringify({
    uuid: user.uuid,
    role: user.role,
    isAdminOwner: user.admin && user.admin.isAdminOwner,
  });

  console.log(`isAdminOwner: ${user.admin && user.admin.isAdminOwner}`);

  const baseEncode = async () =>
    `${base64url(jwtHeader)}.${base64url(jwtPayload)}`;

  const hashSignature = async dataToHash => {
    const hash = CryptoJS.HmacSHA256(dataToHash, process.env.SECRET);
    const encodedHash = CryptoJS.enc.Base64.stringify(hash);
    // 'URLSafeBase64' switches out the url unsafe
    // characters that would otherwise be escaped
    // by the browser. jt uses only url safe characters
    const str = URLSafeBase64.encode(encodedHash);
    return str;
  };

  const data = await baseEncode();
  const signature = await hashSignature(data);
  const token = `${data}.${signature}`;
  return {
    data,
    signature,
    token,
  };
}

module.exports = createJWT;
