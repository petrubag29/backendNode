const randomstring = require('randomstring');

const generateRandomPassword = () =>
  randomstring.generate({
    length: 10,
    readable: true,
    charset: 'alphanumeric',
  });

module.exports = generateRandomPassword;
