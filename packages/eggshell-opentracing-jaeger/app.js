const APPLICATION_TRACER = Symbol.for('Application#tracer');
const initTraceDelegate = require('./lib');

module.exports = (app) => {
  app[APPLICATION_TRACER] = initTraceDelegate(app);
};
