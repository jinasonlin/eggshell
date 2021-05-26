const assert = require('assert');
const cluster = require('cluster');
const { Span } = require('opentracing');
const address = require('address');
const SpanContext = require('./span_context');

const REFERENCES = Symbol('EggSpan#references');
const CONTEXT = Symbol('EggSpan#context');
const TAGS = Symbol('EggSpan#tags');
const WORKER_ID = (cluster.worker && cluster.worker.id) || 0;
const IPV4 = address.ip();
const IPV6 = address.ipv6();

class EggSpan extends Span {
  constructor(tracer, options) {
    assert(tracer, 'tracer is required');
    assert(tracer.app, 'tracer.app is required');

    super();

    this.app = tracer.app;
    this.tracer = tracer;
    this.startTime = Date.now();
    this.finishTime = null;
    this[REFERENCES] = [];
    this[TAGS] = new Map();

    if (options.references) {
      for (const ref of options.references) {
        this[REFERENCES].push(ref);
      }
    }

    this[CONTEXT] = new SpanContext({ span: this });

    // default tags
    const appname = this.app.config.name;
    this.setTag('component', 'egg');
    this.setTag('appname', appname);
    this.setTag('worker.id', WORKER_ID);
    this.setTag('process.id', process.pid);
    this.setTag('local.ipv4', IPV4);
    this.setTag('local.ipv6', IPV6);
  }

  get operationName() {
    return this._operationName;
  }

  lastReference() {
    if (!this[REFERENCES].length) return null;

    return this[REFERENCES][this[REFERENCES].length - 1];
  }

  parentContext() {
    const reference = this.lastReference();
    return reference && reference.referencedContext();
  }

  /**
   * @override
   */
  _context() {
    return this[CONTEXT];
  }

  /**
   * @override
   */
  _tracer() {
    return this.tracer;
  }

  /**
   * @override
   */
  _setOperationName(name) {
    this._operationName = name;
  }

  /**
   * @override
   */
  _setBaggageItem(key, value) {
    this[CONTEXT].setBaggage(key, value);
  }

  /**
   * @override
   */
  _getBaggageItem(key) {
    return this[CONTEXT].getBaggage(key);
  }

  /**
   * @override
   */
  _addTags(tags) {
    for (const key of Object.keys(tags)) {
      if (!key) continue;
      this[TAGS].set(key, tags[key]);
    }
  }

  getTag(key) {
    return this[TAGS].get(key);
  }

  getTags() {
    const result = {};
    for (const [key, value] of this[TAGS].entries()) {
      result[key] = value;
    }
    return result;
  }

  _finish(finishTime) {
    this.finishTime = finishTime || Date.now();
    this.tracer._report(this);
  }
}

module.exports = EggSpan;
