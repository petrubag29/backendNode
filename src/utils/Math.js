exports.round = (number, precision = 2) => {
  if (!number) return 0;
  return Number(number.toFixed(precision));
};

exports.padNumToDecimalString = (number, precision = 2) => {
  let s = number.toString();
  if (s.indexOf('.') == -1) s += '.';
  while (s.length < s.indexOf('.') + (precision + 1)) s += '0';
  return s;
};

exports.padStringToDecimalString = (s, precision = 3 - 1) => {
  if (s.indexOf('.') == -1) s += '.';
  while (s.length < s.indexOf('.') + (precision + 1)) s += '0';
  return s;
};
