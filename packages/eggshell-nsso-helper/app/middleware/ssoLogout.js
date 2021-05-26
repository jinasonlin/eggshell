const assert = require('assert');

module.exports = () => async (/** @type {Egg.Context} */ ctx, next) => {
  const { app: { config: { nsso, nssoLogout } }, protocol, boomHost, queryobject, cookies } = ctx;
  const { logoutRedirect } = nssoLogout;
  const { host, service, cookieName, allowSSOCookie } = nsso;
  const { withoutTarget, targetPath = '/', targetURL = `${protocol}://${boomHost}${targetPath}`, skip } = queryobject;

  assert(service, 'nsso service is required');

  if (allowSSOCookie) {
    // 清空 cookie
    cookies.set(cookieName, null);
  }

  // 清空 session
  ctx.session = null;

  if (skip) {
    return next();
  }

  if (logoutRedirect) {
    const logoutURL = `https://${host}/logout.html?service=${service}${withoutTarget !== 'true' ? `&target=${encodeURIComponent(targetURL)}` : ''}`;

    ctx.redirect(logoutURL);
  }
};
