const mongoose = require('mongoose');
const userSchema = require('./schemas/user');

// create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
