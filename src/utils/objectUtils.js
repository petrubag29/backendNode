const setVal = require('set-value');

// gets the value of an arbitrarily nested value
// safely drills down to find a value and if it
// doesn't exist or it's path doesn't exist then 'null'
// is returned.
// parameters: (p = array of path values, o = the object to search)
exports.get = (p, o) => p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

// sets the given value fo an object.
// parameters: (
//  object = object to set val on,
//  string = path used to set val [ex... 'something.another.another',
//  value = val to set]
// );
exports.setValue = setVal;
