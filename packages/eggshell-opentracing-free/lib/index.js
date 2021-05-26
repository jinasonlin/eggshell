const { Tracer } = require('opentracing');
const EggTracer = require('./tracer');

const ROOTSPAN = Symbol('Opentracing#rootSpan');

module.exports = (app) => {
  const tracer = new EggTracer(app, app.config.opentracingFree);

  class TracerDelegate extends Tracer {
    get tracer() {
      return tracer;
    }

    get traceId() {
      return this[ROOTSPAN] && this[ROOTSPAN].context().traceId;
    }

    get spanId() {
      return this[ROOTSPAN] && this[ROOTSPAN].context().spanId;
    }

    get parentId() {
      return this[ROOTSPAN] && this[ROOTSPAN].context().parentId;
    }

    startSpan(...args) {
      const span = tracer.startSpan(...args);

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
