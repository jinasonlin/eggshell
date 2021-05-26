const assert = require('assert');

module.exports = () => async (/** @type {Egg.Context} */ ctx, next) => {
  const { app: { config: { nsso, nssoCallback } }, queryobject, cookies } = ctx;
  const { loginRedirect } = nssoCallback;
  const { host, service, cookieName, allowSSOCookie } = nsso;
  const { returnURL, ticket } = queryobject;
  const redirectURL = returnURL ? Buffer.from(returnURL, 'base64').toString() : '/';

  assert(service, 'nsso service is required');

  if (!ticket) {
    if (allowSSOCookie) {
      // 清空cookie，返回起始页
      cookies.set(cookieName, null);
    }
    ctx.redirect(redirectURL);
    return;
  }

  const { data } = await ctx.curl(`https://${host}/validate/?ticket=${ticket}&service=${service}`, { dataType: 'json' });

  if (!data.id && data.result === false) {
    if (allowSSOCookie) {
      // 清空cookie，返回起始页
      cookies.set(cookieName, null);
    }
    ctx.redirect(redirectURL);
    return;
  }

  if (allowSSOCookie) {
    const cookieValue = ctx.helper.encrypt(data);
    cookies.set(cookieName, cookieValue, { signed: false });
  }

  // 添加 nssoRawData 到上下文，用于数据落库
  // ctx.nssoRawData = data;
  ctx.session.user = data;

  await next();

  if (loginRedirect) {
    ctx.redirect(redirectURL);
  }
};
