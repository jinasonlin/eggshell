const { SpanContext } = require('opentracing');
const generateTraceId = require('./util/traceid').generate;
const generateSpanId = require('./util/spanid').generate;

const BAGGAGES = Symbol('SpanContext#baggages');

class EggSpanContext extends SpanContext {
  constructor(options) {
    super();

    this[BAGGAGES] = new Map();

    let parentContext;
    if (options.span) {
      parentContext = options.span.parentContext();
    }

    let _traceId;
    let _spanId;
    let _parentId;

    if (parentContext) {
      // from a parent context
      _traceId = parentContext.traceId;
      _parentId = parentContext.spanId;
      _spanId = generateSpanId();
      this.setBaggages(parentContext.getBaggages());
    } else if (options.traceId && options.spanId) {
      // from extracted context
      ({ traceId: _traceId, spanId: _spanId } = options);

      if (options.baggages) {
        this.setBaggages(options.baggages);
      }
    } else {
      // default context
      _traceId = generateTraceId();
      _spanId = generateSpanId();
    }

    this._traceId = _traceId;
    this._spanId = _spanId;
    this._parentId = _parentId;
  }

  get traceId() {
    return this._traceId;
  }

  get spanId() {
    return this._spanId;
  }

  get parentId() {
    return this._parentId;
  }

  /**
   * @override
   */
  toTraceId() {
    return this.traceId;
  }

  /**
   * @override
   */
  toSpanId() {
    return this.spanId;
  }

  setBaggage(key, value) {
    if (!key) return;
    this[BAGGAGES].set(key, value);
  }

  getBaggage(key) {
    return this[BAGGAGES].get(key);
  }

  setBaggages(baggages) {
    if (!baggages) return;
    for (const key of Object.keys(baggages)) {
      this.setBaggage(key, baggages[key]);
    }
  }

  getBaggages() {
    const result = {};
    for (const [key, value] of this[BAGGAGES].entries()) {
      result[key] = value;
    }
    return result;
  }
}

module.exports = EggSpanContext;
