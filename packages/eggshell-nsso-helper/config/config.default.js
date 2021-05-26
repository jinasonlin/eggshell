exports.nsso = {
  // CRYPTO_KEY,
  // CRYPTO_IV,
  // host,
  // cookieName,
  // service,
  allowSSOCookie: false,
};

exports.nssoLogin = {
  loginCallbackRouteName: 'ssoCallback',
};

exports.nssoLogout = {
  logoutRedirect: true,
};

exports.nssoCallback = {
  loginRedirect: true,
};
