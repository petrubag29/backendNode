function logoutUser(obj, args, context) {
  const { currentUser, res } = context;

  const logoutUserReturn = {
    wasSuccessful: true,
    userError: null,
  };

  if (currentUser) {
    res.clearCookie('jwtData');
    res.clearCookie('jwtSignature', { httpOnly: true });
  } else {
    logoutUserReturn.wasSuccessful = false;
    logoutUserReturn.userError = 'You are not currently logged in.';
  }

  return logoutUserReturn;
}

module.exports = logoutUser;
