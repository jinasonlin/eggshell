const assert = require('assert');
const inspector = require('inspector');

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app, port) => {
  assert(port, 'appPort & agentPort required');

  app.messenger.on('startInspector', async () => {
    inspector.open(port, '0.0.0.0');

    const url = inspector.url();

    if (!url) {
      app.logger.info(`[inspector] ${app.type} inspector was occupied`);
      return;
    }

    // app.logger.info(`[inspector] ${app.type} inspector start => ${`chrome-devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&${url}`}`);
    app.logger.info(`[inspector] ${app.type} inspector start`);
  });

  app.messenger.on('stopInspector', () => {
    inspector.close();

    app.logger.info(`[inspector] ${app.type} inspector stop`);
  });
};
