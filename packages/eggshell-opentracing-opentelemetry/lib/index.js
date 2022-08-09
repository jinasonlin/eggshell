const { Tracer } = require('opentracing');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { Resource } = require('@opentelemetry/resources');
const { ParentBasedSampler, TraceIdRatioBasedSampler } = require('@opentelemetry/core');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor, BatchSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { TracerShim } = require('@opentelemetry/shim-opentracing');
const { tracerName, traceUrl } = require('./constant');

const ROOTSPAN = Symbol('Opentracing#rootSpan');

module.exports = (app) => {
  const {
    env,
    opentracingOpentelemetry: {
      debug,
      simulate,
      serviceName,
      serviceId,
      companyName,
      samplerRatio,
    },
  } = app.config;

  debug && diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName, // CMDB中应用名
      'service.id': serviceId, // CMDB中应用ID
      'company.id': companyName, // 保险固定为 10022 ，科技固定为 79002，子公司请咨询六翼
      env, // 部署物理环境code : test，pre，prd，pub}}   // ship 部署环境code
    }),
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(samplerRatio),
    }),
  });

  provider.addSpanProcessor(simulate
    ? new SimpleSpanProcessor(new ConsoleSpanExporter())
    : new BatchSpanProcessor(new OTLPTraceExporter({
      url: traceUrl[env],
    })));

  provider.register();

  const tracer = new TracerShim(provider.getTracer(tracerName));

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
