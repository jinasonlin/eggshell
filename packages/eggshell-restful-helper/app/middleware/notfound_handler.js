module.exports = () => {
  return async function notFoundHandler(/** @type {Egg.Context} */ ctx, next) {
    await next();
    // 优先于内置 notfound 中间件对 json 返回的处理
    if (ctx.status === 404 && !ctx.body && ctx.acceptJSON) {
      ctx.throwNotFoundError();
    }
  };
};
