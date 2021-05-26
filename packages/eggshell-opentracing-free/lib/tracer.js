const assert = require('assert');
const { Tracer, FORMAT_HTTP_HEADERS } = require('opentracing');
const httpHeadersCarrier = require('./carrier/http_headers_carrier');
const logReporter = require('./reporter/log_reporter');
const Span = require('./span');
const SpanContext = require('./span_context');

const CARRIER = Symbol('OpenTracing#CARRIER');
const REPORTER = Symbol('OpenTracing#REPORTER');

class EggTracer extends Tracer {
  constructor(app, config) {
    super();

    this.app = app;
    this.config = config;
    this[CARRIER] = new Map();
    this[REPORTER] = new Map();

    // add default carrier and reporter
    this.setCarrier(FORMAT_HTTP_HEADERS, httpHeadersCarrier);
    this.setReporter('log', logReporter);

    for (const key of Object.keys(this.config.carrier)) {
      const carrier = this.config.carrier[key];
      if (carrier === false) continue;
      this.setCarrier(key, carrier);
    }

    for (const key of Object.keys(this.config.reporter)) {
      const reporter = this.config.reporter[key];
      if (reporter === false) continue;
      this.setReporter(key, reporter);
    }
  }

  setReporter(key, Reporter) {
    assert(Reporter && Reporter.prototype && Reporter.prototype.report, 'Reporter should implement report');
    this[REPORTER].set(key, new Reporter(this.app));
  }

  setCarrier(key, Carrier) {
    assert(Carrier && Carrier.prototype.inject && Carrier.prototype.extract, 'Collector should implement collect');
    this[CARRIER].set(key, new Carrier(this.app));
  }

  getCarrier(key) {
    return this[CARRIER].get(key);
  }

  _startSpan(name, options) {
    assert(name, 'name is required when startSpan');

    const span = new Span(this, options);
    span.setOperationName(name);

    return span;
  }

  _inject(spanContext, format, carrier) {
    carrier = carrier || {};
    const carrierInstance = this.getCarrier(format);
    assert(carrierInstance, `${format} is unknown carrier`);
    Object.assign(carrier, carrierInstance.inject(spanContext));
  }

  _extract(format, carrier) {
    const carrierInstance = this.getCarrier(format);
    assert(carrierInstance, `${format} is unknown carrier`);
    const result = carrierInstance.extract(carrier);
    if (!(result.traceId && result.spanId)) return null;

    const spanContext = new SpanContext({
      traceId: result.traceId,
      spanId: result.spanId,
      rpcId: result.rpcId,
      baggages: result.baggage,
    });
    return spanContext;
  }

  _report(span) {
    if (!(span instanceof Span)) return;

    // it will be run in next tick,
    // ignore error
    process.nextTick(() => {
      for (const reporter of this[REPORTER].values()) {
        try {
          reporter.report(span);
        } catch (err) {
          this.app.logger.error(err);
        }
      }
    });
  }
}

module.exports = EggTracer;
