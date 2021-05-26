const assert = require('assert');
const TCPProxy = require('tcp-proxy.js');

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app, proxyPort) => {
  const { config: { inspector: { forwardPort, forwardHost } } } = app;
  assert(proxyPort, 'proxyPort required');
  assert(forwardPort, 'forwardPort required');

  const proxy = new TCPProxy({ port: proxyPort });

  app.messenger.on('startDBProxy', async () => {
    proxy.createProxy({
      forwardPort,
      forwardHost,
    });

    app.logger.info('[inspector] db proxy start');
  });

  app.messenger.on('stopDBProxy', () => {
    proxy.end();

    app.logger.info('[inspector] db proxy stop');
  });
};
