const inspector = require('./lib/inspector');
const proxy = require('./lib/proxy');

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { config: { inspector: { debugEnable, agentPort, proxyEnable, proxyPort } } } = app;
  debugEnable && inspector(app, agentPort);
  proxyEnable && proxy(app, proxyPort);
};
