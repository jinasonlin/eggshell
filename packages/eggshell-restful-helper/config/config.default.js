
/**
 * 统一 json 错误规范
 */
exports.onerror = {
  json(err, ctx) {
    ctx.failure(err);
  },
};
