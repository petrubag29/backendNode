const {
  customer,
  agent,
  admin,
  superAdmin,
} = require('../../constants/userTypes');
const {
  returnViewableUserFields,
  returnAllUsersViewableFields,
} = require('./dataAccessAuthorzation');

function shouldReturnAllUsers(currentUser = {}) {
  return currentUser.role === admin || currentUser.role === superAdmin;
}

function shouldReturnUser(currentUser = {}, user = {}) {
  if (currentUser.uuid === user.uuid) return true;

  if (user.role === agent) return true;

  if (currentUser.role === superAdmin) return true;

  if (currentUser.role === admin && user.role !== superAdmin) return true;

  if (
    currentUser.role === agent &&
    user.role !== admin &&
    user.role !== superAdmin &&
    user.role !== customer
  ) {
    return true;
  }

  return false;
}

module.exports = {
  shouldReturnAllUsers,
  shouldReturnUser,
  returnViewableUserFields,
  returnAllUsersViewableFields,
};
