const sanitizer = require('sanitizer');

function cleanUserInput(inputObj) {
  if (!inputObj) {
    throw new Error(
      'function "cleanUserInput" must recieve an object as it\'s argument'
    );
  }
  Object.keys(inputObj).forEach(key => {
    if (key === 'password') return;
    let item = inputObj[key];
    if (typeof item !== 'string') return;
    item = sanitizer.sanitize(item);
    inputObj[key] = item.trim();
  });
  return inputObj;
}

module.exports = cleanUserInput;
