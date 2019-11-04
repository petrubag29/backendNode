const randomstring = require('randomstring');

const generateRandomID = (length = 6) =>
  randomstring.generate({
    length,
    readable: true,
    charset: 'alphanumeric',
  });

module.exports = generateRandomID;
