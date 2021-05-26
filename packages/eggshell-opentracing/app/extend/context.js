const APPLICATION_TRACER = Symbol.for('Application#tracer');
const TRACER = Symbol('Context#tracer');

module.exports = {
  get tracer() {
    if (this[TRACER]) return this[TRACER];
    if (!this.app[APPLICATION_TRACER]) throw new Error('application tracer drelegate not found, you can use plugin `free` or `jaeger`');
    const tracer = this[TRACER] = new this.app[APPLICATION_TRACER]();
    return tracer;
  },
};
