const Twilio = require('twilio');

const accountSid = process.env.TWILIO_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console

const client = new Twilio(accountSid, authToken);

const formatPhoneNumbers = phoneNumber => {
  const phoneNumberRegEx = /^\(\d{3}\) \d{3}-\d{4}( x\d+)?$/;

  if (!phoneNumberRegEx.test(phoneNumber)) return phoneNumber;

  const numbersArray = phoneNumber.match(/(\d+)/g);

  const numberString = numbersArray.join('');

  return numberString;
};

exports.sendOneText = ({ body, to }) =>
  client.messages.create({
    body,
    to: `+1${formatPhoneNumbers(to)}`, // Text this number
    from: `+1${formatPhoneNumbers(process.env.TWILIO_PHONE_NUMBER)}`, // From a valid Twilio number
  });
