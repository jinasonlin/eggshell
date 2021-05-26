const Sentry = require('@sentry/node');

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  Sentry.init({
    ...app.config.sentry,
    environment: app.config.env,
  });

  app.on('error', (err, ctx) => {
    ctx = ctx || app.createAnonymousContext();

    if (ctx.user) {
      Sentry.withScope((scope) => {
        const { id, name, username, email } = ctx.user;
        scope.setUser({ id, name, username, email });
        Sentry.captureException(err);
      });
    } else {
      Sentry.captureException(err);
    }
  });
};
