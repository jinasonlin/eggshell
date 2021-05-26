module.exports = (/** @type {Egg.Application} */ app) => {
  // 注意现有顺序
  app.config.coreMiddleware.push('notfoundHandler');
  app.config.coreMiddleware.push('errorHandler');
};
