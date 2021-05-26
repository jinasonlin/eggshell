const Sentry = require('@sentry/node');

module.exports = (app) => {
  Sentry.init(app.config.sentry);

  app.on('error', (err) => {
    Sentry.captureException(err);
  });
};
