const { FORMAT_HTTP_HEADERS, Tags } = require('opentracing');

const HTTP_SERVER_SPAN = Symbol.for('Request#httpServerSpan');
const HTTP_CLIENT_SPAN = Symbol.for('Request#httpClientSpan');
// https://github.com/opentracing/specification/blob/master/semantic_conventions.md
const {
  SPAN_KIND,
  SPAN_KIND_RPC_SERVER,
  SPAN_KIND_RPC_CLIENT,
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

exports.logMiddleware = () => async (/** @type {Egg.Context} */ ctx, next) => {
  const spanContext = ctx.tracer.extract(FORMAT_HTTP_HEADERS, ctx.header);
  const span = ctx.tracer.startSpan('http_server', { childOf: spanContext });
  span.setTag(SPAN_KIND, SPAN_KIND_RPC_SERVER);
  ctx.req[HTTP_SERVER_SPAN] = span;

  try {
    await next();

    const socket = ctx.req.socket || ctx.req.connection;
    // TODO: what's the service name of the remote server
    // span.setTag(PEER_SERVICE);
    // span.setTag(PEER_ADDRESS);
    span.setTag(PEER_HOSTNAME, ctx.host);
    span.setTag(PEER_PORT, socket.remotePort);
    if (socket.remoteFamily === 'IPv4') {
      span.setTag(PEER_HOST_IPV4, socket.remoteAddress);
    } else if (socket.remoteFamily === 'IPv6') {
      span.setTag(PEER_HOST_IPV6, socket.remoteAddress);
    }
    span.setTag(HTTP_URL, ctx.url);
    span.setTag(HTTP_METHOD, ctx.method);
    span.setTag(HTTP_STATUS_CODE, ctx.realStatus);
    span.setTag('http.request_size', ctx.get('content-length') || 0);
    span.setTag('http.response_size', ctx.length || 0);
    span.finish();
  } catch (error) {
    if (span) {
      span.setTag(ERROR, true);
      span.log({
        event: ERROR,
        'error.object': error,
        'error.kind': error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    throw error;
  }
};

exports.logHTTPServer = (/** @type {Egg.Application} */ app) => {
  app.on('request', (/** @type {Egg.Context} */ ctx) => {
    const spanContext = ctx.tracer.extract(FORMAT_HTTP_HEADERS, ctx.header);
    const span = ctx.tracer.startSpan('http_server', { childOf: spanContext });
    span.setTag(SPAN_KIND, SPAN_KIND_RPC_SERVER);
    ctx.req[HTTP_SERVER_SPAN] = span;
  });
  app.on('response', (ctx) => {
    const span = ctx.req[HTTP_SERVER_SPAN];
    const socket = ctx.req.socket || ctx.req.connection;
    // TODO: what's the service name of the remote server
    // span.setTag(PEER_SERVICE);
    // span.setTag(PEER_ADDRESS);
    span.setTag(PEER_HOSTNAME, ctx.host);
    span.setTag(PEER_PORT, socket.remotePort);
    if (socket.remoteFamily === 'IPv4') {
      span.setTag(PEER_HOST_IPV4, socket.remoteAddress);
    } else if (socket.remoteFamily === 'IPv6') {
      span.setTag(PEER_HOST_IPV6, socket.remoteAddress);
    }
    span.setTag(HTTP_URL, ctx.url);
    span.setTag(HTTP_METHOD, ctx.method);
    span.setTag(HTTP_STATUS_CODE, ctx.realStatus);
    span.setTag('http.request_size', ctx.get('content-length') || 0);
    span.setTag('http.response_size', ctx.length || 0);
    span.finish();
  });
  app.on('error', (error, ctx) => {
    ctx = ctx || app.createAnonymousContext();
    const span = ctx.req[HTTP_SERVER_SPAN];
    if (span) {
      span.setTag(ERROR, true);
      span.log({
        event: ERROR,
        'error.object': error,
        'error.kind': error.name,
        message: error.message,
        stack: error.stack,
      });
    }
  });
};

exports.logHTTPClient = (app) => {
  app.httpclient.on('request', (req) => {
    const ctx = req.ctx || app.createAnonymousContext();
    const parentSpan = ctx.req[HTTP_SERVER_SPAN];
    const { args } = req;
    if (!args.headers) args.headers = {};
    const span = ctx.tracer.startSpan('http_client', { childOf: parentSpan });
    span.setTag(SPAN_KIND, SPAN_KIND_RPC_CLIENT);
    ctx.tracer.inject(span.context(), FORMAT_HTTP_HEADERS, args.headers);
    req[HTTP_CLIENT_SPAN] = span;
  });
  app.httpclient.on('response', ({ req, res, error }) => {
    const span = req[HTTP_CLIENT_SPAN];
    if (error) {
      span.setTag(ERROR, true);
      span.log({
        event: ERROR,
        'error.object': error,
        'error.kind': error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    const socket = res.socket || res.connection || req.socket || req.connection;
    // node@12+ 提供 socket.remoteAddress()，方便获取远端地址
    // const address = socket.address();

    // TODO
    // span.setTag(PEER_SERVICE, req.options.host);
    // span.setTag(PEER_ADDRESS, address.address);
    span.setTag(PEER_HOSTNAME, req.options.host);
    span.setTag(PEER_PORT, socket.remotePort);
    if (socket.remoteFamily === 'IPv4') {
      span.setTag(PEER_HOST_IPV4, socket.remoteAddress);
    } else if (socket.remoteFamily === 'IPv6') {
      span.setTag(PEER_HOST_IPV6, socket.remoteAddress);
    }
    span.setTag(HTTP_URL, req.url);
    span.setTag(HTTP_METHOD, req.options.method);
    span.setTag(HTTP_STATUS_CODE, res.status);
    span.setTag('http.request_size', req.size || 0);
    span.setTag('http.response_size', res.size || 0);
    span.finish();
  });
};
