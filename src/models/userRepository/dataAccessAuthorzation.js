const {
  customer,
  agent,
  admin,
  superAdmin,
  anonymous,
} = require('../../constants/userTypes');

const customers = {
  uuid: [customer, agent, admin, superAdmin, anonymous],
  firstName: [customer, agent, admin, superAdmin, anonymous],
  lastName: [customer, agent, admin, superAdmin, anonymous],
  email: [customer, agent, admin, superAdmin, anonymous],
  role: [customer, admin, superAdmin],
  lastLoginTimestamp: [admin, superAdmin],
  createdAt: [admin, superAdmin],
  customer: {
    profilePicURL: [customer, admin, superAdmin],
    interest: [customer, admin, superAdmin],
    likedProperties: [customer, admin, superAdmin],
  },
};

const agents = {
  uuid: [customer, agent, admin, superAdmin, anonymous],
  firstName: [customer, agent, admin, superAdmin, anonymous],
  lastName: [customer, agent, admin, superAdmin, anonymous],
  email: [customer, agent, admin, superAdmin, anonymous],
  role: [agent, admin, superAdmin],
  lastLoginTimestamp: [admin, superAdmin],
  createdAt: [admin, superAdmin],
  agent: {
    agentType: [agent, admin, superAdmin],
    state: [agent, admin, superAdmin],
    areaOfFocus: [customer, agent, admin, superAdmin, anonymous],
    profilePicURL: [customer, agent, admin, superAdmin, anonymous],
    branch: [customer, agent, admin, superAdmin, anonymous],
    mobileNumber: [customer, agent, admin, superAdmin, anonymous],
    officeNumber: [customer, agent, admin, superAdmin, anonymous],
    realEstateLicenseNumber: [agent, admin, superAdmin],
    listings: [customer, agent, admin, superAdmin, anonymous],
    ACHAccountNumber: [agent, admin, superAdmin],
    ACHAccountBankRoutingNumber: [agent, admin, superAdmin],
    title: [customer, agent, admin, superAdmin, anonymous],
    facebook: [customer, agent, admin, superAdmin, anonymous],
    twitter: [customer, agent, admin, superAdmin, anonymous],
    instagram: [customer, agent, admin, superAdmin, anonymous],
    profileDescription: [customer, agent, admin, superAdmin, anonymous],
    invoices: [agent, admin, superAdmin],
    createdBy: [admin, superAdmin],
    updatedAt: [admin, superAdmin],
    updatedBy: [admin, superAdmin],
  },
};

const admins = {
  uuid: [admin, superAdmin],
  firstName: [admin, superAdmin],
  lastName: [admin, superAdmin],
  email: [admin, superAdmin],
  role: [admin, superAdmin],
  lastLoginTimestamp: [admin, superAdmin],
  createdAt: [superAdmin],
  admin: {
    mobileNumber: [admin, superAdmin],
    officeNumber: [admin, superAdmin],
    state: [admin, superAdmin],
    branch: [admin, superAdmin],
    profilePicURL: [admin, superAdmin],
    createdBy: [superAdmin],
    updatedBy: [superAdmin],
    updatedAt: [superAdmin],
    isAdminOwner: [superAdmin],
  },
};

const permissions = {
  [customer]: customers,
  [agent]: agents,
  [admin]: admins,
  [superAdmin]: admins,
};

const returnViewableUserFields = (currentUser, userDoc) => {
  const user = userDoc._doc;
  const currentUserRole = currentUser ? currentUser.role : anonymous;
  const currentUserUUID = currentUser ? currentUser.uuid : null;
  const subDocType = user.role === superAdmin ? admin : user.role;
  const returnedUser = {};
  const subDocument = {};
  Object.keys(user).forEach(key => {
    if (user.role === key || (user.role === superAdmin && key === admin)) {
      Object.keys(permissions[user.role][key]).forEach(subKey => {
        const authorizedRoles = permissions[user.role][key][subKey];
        if (authorizedRoles && authorizedRoles.includes(currentUserRole)) {
          if (
            currentUserRole === agent &&
            subKey === 'ACHAccountNumber' &&
            currentUserUUID !== user.uuid
          )
            return;
          subDocument[subKey] = userDoc[key][subKey];
        }
      });
      return;
    }

    const authorizedRoles = permissions[user.role][key];
    if (authorizedRoles && authorizedRoles.includes(currentUserRole)) {
      returnedUser[key] = user[key];
    }
  });

  returnedUser[subDocType] = subDocument;

  return returnedUser;
};

const returnAllUsersViewableFields = (currentUser, users) => {
  return users.map(user => returnViewableUserFields(currentUser, user));
};

module.exports = {
  customers,
  agents,
  admin,
  permissions,
  returnViewableUserFields,
  returnAllUsersViewableFields,
};
