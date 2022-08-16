const assert = require('assert');
const { Tracer, FORMAT_HTTP_HEADERS } = require('opentracing');
const { initTracer, ZipkinB3TextMapCodec } = require('jaeger-client');

const ROOTSPAN = Symbol('Opentracing#rootSpan');

module.exports = (app) => {
  assert(app.config.opentracingJaeger.serviceName, 'opentracingJaeger serviceName is required');

  const tracer = initTracer(app.config.opentracingJaeger, {
    logger: app.logger,
  });

  //  zipkin b3 兼容
  const codec = new ZipkinB3TextMapCodec({ urlEncoding: true });

  tracer.registerInjector(FORMAT_HTTP_HEADERS, codec);
  tracer.registerExtractor(FORMAT_HTTP_HEADERS, codec);

  class TracerDelegate extends Tracer {
    get tracer() {
      return tracer;
    }

    get traceId() {
      return this[ROOTSPAN] && this[ROOTSPAN].context().traceIdStr || this[ROOTSPAN].context().spanIdStr;
    }

    get spanId() {
      return this[ROOTSPAN] && this[ROOTSPAN].context().spanIdStr;
    }

    get parentId() {
      return this[ROOTSPAN] && this[ROOTSPAN].context().parentIdStr;
    }

    startSpan(name, options) {
      if (this[ROOTSPAN]) {
        options = { childOf: this[ROOTSPAN], ...options };
      }

      const span = tracer.startSpan(name, options);

      // set root span
      if (!this[ROOTSPAN]) this[ROOTSPAN] = span;

      return span;
    }

    inject(...args) {
      return tracer.inject(...args);
    }

    extract(...args) {
      return tracer.extract(...args);
    }
  }

  return TracerDelegate;
};
