const inspector = require('./lib/inspector');

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { config: { inspector: { debugEnable, appPort } } } = app;
  debugEnable && inspector(app, appPort);
};
