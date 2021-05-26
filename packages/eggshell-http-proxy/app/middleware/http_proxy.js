const compose = require('koa-compose');
const getProxyMiddlewares = require('../../lib/za-proxy-middleware');

const APPLICATION_TRACER = Symbol.for('Application#tracer');
const HTTP_SERVER_SPAN = Symbol.for('Request#httpServerSpan');

module.exports = (proxy, app) => {
  const tracer = app[APPLICATION_TRACER] && new app[APPLICATION_TRACER]();

  const proxyMiddlewares = getProxyMiddlewares(proxy, { type: 'egg', tracer, HTTP_SERVER_SPAN });

  if (!proxyMiddlewares || !proxyMiddlewares.length) return (ctx, next) => next();

  return compose(proxyMiddlewares);
};
