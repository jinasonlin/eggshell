class LogReporter {
  constructor(app) {
    this.app = app;
    this.level = (process.env.LOG_REPORTER_LEVEL || 'DEBUG').toLocaleLowerCase();
  }

  report(span) {
    const ctx = span.context();
    this.app.logger[this.level]('opentracing', `traceId = ${ctx.traceId}`, `spanId = ${ctx.spanId}`, `parentId = ${ctx.parentId}`, `http.url = ${span.getTag('http.url')}`, '||', span.operationName);
  }
}

module.exports = LogReporter;
