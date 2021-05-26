const assert = require('assert');

module.exports = () => async (/** @type {Egg.Context} */ ctx, next) => {
  const { app: { config: { nsso, nssoLogin } }, queryobject } = ctx;
  const { loginCallbackRouteName } = nssoLogin;
  const { host, service } = nsso;
  const { returnURL = '/', skip } = queryobject;

  assert(service, 'nsso service is required');
  assert(loginCallbackRouteName, 'loginCallbackRouteName is required');

  if (skip) {
    return next();
  }

  const targetURL = ctx.helper.boomUrlFor(loginCallbackRouteName, {
    returnURL: Buffer.from(returnURL).toString('base64'),
  });

  const loginURL = `https://${host}/login.html?service=${service}&target=${encodeURIComponent(targetURL)}`;

  ctx.redirect(loginURL);
};
