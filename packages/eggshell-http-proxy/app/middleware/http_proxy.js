const compose = require('koa-compose');
const getProxyMiddlewares = require('../../lib/za-proxy-middleware');

const APPLICATION_TRACER = Symbol.for('Application#tracer');

// TODO 动态创建，使用 ctx tracer
module.exports = (proxy, app) => {
  const tracer = app[APPLICATION_TRACER] && new app[APPLICATION_TRACER]();

  const proxyMiddlewares = getProxyMiddlewares(proxy, { type: 'egg', tracer });

  if (!proxyMiddlewares || !proxyMiddlewares.length) return (ctx, next) => next();

  return compose(proxyMiddlewares);
};
