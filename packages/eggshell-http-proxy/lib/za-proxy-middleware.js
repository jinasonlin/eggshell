const httpProxyMiddleware = require('http-proxy-middleware');
const c2k = require('koa-connect');
const { FORMAT_HTTP_HEADERS, Tags } = require('opentracing');

const {
  SPAN_KIND,
  // PEER_SERVICE,
  // PEER_ADDRESS,
  PEER_HOSTNAME,
  PEER_HOST_IPV4,
  PEER_HOST_IPV6,
  PEER_PORT,
  HTTP_URL,
  HTTP_METHOD,
  HTTP_STATUS_CODE,
  ERROR,
} = Tags;

const HTTP_SERVER_SPAN = Symbol.for('Request#httpServerSpan');
const PROXY_SPAN = Symbol.for('proxy#span');

module.exports = (proxy, { tracer } = {}) => {
  const proxyMiddlewares = [];
  // Avoid 'proxy' declaration with const
  let _proxy = proxy;

  if (_proxy) {
    /**
     * Assume a proxy configuration specified as:
     * proxy: 'a url'
     */
    if (typeof _proxy === 'string') {
      _proxy = [{
        context: _proxy,
      }];
    }

    /**
     * Assume a proxy configuration specified as:
     * proxy: {
     *   'context': { options }
     * }
     * OR
     * proxy: {
     *   'context': 'target'
     * }
     */
    if (!Array.isArray(_proxy)) {
      _proxy = Object.keys(_proxy).map((context) => {
        let proxyOptions;
        // For backwards compatibility reasons.
        const correctedContext = context.replace(/^\*$/, '**').replace(/\/\*$/, '');

        if (typeof _proxy[context] === 'string') {
          proxyOptions = {
            context: correctedContext,
            target: _proxy[context],
          };
        } else {
          proxyOptions = _proxy[context];
          proxyOptions.context = correctedContext;
        }

        return proxyOptions;
      });
    }

    if (tracer) {
      _proxy.forEach((proxyConfig) => {
        const context = proxyConfig.context || proxyConfig.path;

        // eslint-disable-next-line
        proxyConfig.onProxyReq = (proxyReq, req, res) => {
          const parentSpanContext = req[HTTP_SERVER_SPAN]
            ? req[HTTP_SERVER_SPAN]
            : tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
          const spanOptions = {};
          if (parentSpanContext) {
            spanOptions.childOf = parentSpanContext;
          }

          const span = tracer.startSpan('http_proxy', spanOptions);

          span.setTag(SPAN_KIND, 'proxy');
          span.setTag('proxy.context', context);
          span.setTag(PEER_HOSTNAME, proxyReq.getHeader('x-forwarded-host') || proxyReq.getHeader('host'));
          // protocol => proxyReq.socket.encrypted

          const prxCarrier = {};
          tracer.inject(span.context(), FORMAT_HTTP_HEADERS, prxCarrier);
          Object.entries(prxCarrier).forEach(([key, value]) => proxyReq.setHeader(key, value));

          req[PROXY_SPAN] = span;
        };
        // eslint-disable-next-line
        proxyConfig.onProxyRes = (proxyRes, req, res) => {
          const span = req[PROXY_SPAN];
          if (!span) return;

          const socket = proxyRes.socket || proxyRes.connection;

          span.setTag(PEER_PORT, socket.remotePort);
          if (socket.remoteFamily === 'IPv4') {
            span.setTag(PEER_HOST_IPV4, socket.remoteAddress);
          } else if (socket.remoteFamily === 'IPv6') {
            span.setTag(PEER_HOST_IPV6, socket.remoteAddress);
          }
          span.setTag(HTTP_URL, req.url);
          span.setTag(HTTP_METHOD, req.method);
          span.setTag(HTTP_STATUS_CODE, proxyRes.statusCode);
          span.finish();
        };
        // eslint-disable-next-line
        proxyConfig.onError = (error, req, res) => {
          const span = req[PROXY_SPAN];
          if (!span) return;

          span.setTag(ERROR, true);
          span.log({
            event: ERROR,
            'error.object': error,
            'error.kind': error.name,
            message: error.message,
            stack: error.stack,
          });
        };
      });
    }

    /**
     * Assume a proxy configuration specified as:
     * proxy: [
     *   {
     *     context: ...,
     *     ...options...
     *   }
     * ]
     */
    _proxy.forEach((proxyConfig) => {
      const context = proxyConfig.context || proxyConfig.path;
      if (proxyConfig.target) {
        proxyMiddlewares.push(c2k(httpProxyMiddleware(context, proxyConfig)));
      }
    });
  }

  if (!proxyMiddlewares.length) {
    return null;
  }
  return proxyMiddlewares;
};
