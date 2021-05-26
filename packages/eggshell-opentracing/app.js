const { logHTTPClient, logHTTPServer } = require('./lib/trace');

module.exports = (app) => {
  const { logAgentType } = app.config.opentracing;

  logHTTPClient(app);

  if (logAgentType === 'listen') {
    logHTTPServer(app);
  }
  if (logAgentType === 'middleware') {
    app.config.coreMiddleware.push('opentracing');
  }
};
