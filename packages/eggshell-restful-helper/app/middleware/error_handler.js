module.exports = () => {
  return async function errorHandler(/** @type {Egg.Context} */ ctx, next) {
    try {
      await next();
    } catch (err) {
      // 预定义错误类型直接处理
      if (ctx.isAllowedErrorName(err.name)) {
        return ctx.failure(err);
      }

      throw err;
    }
  };
};
