const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { Resource } = require('@opentelemetry/resources');
const { ParentBasedSampler, TraceIdRatioBasedSampler } = require('@opentelemetry/core');
const { SimpleSpanProcessor, BatchSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { traceUrl } = require('./constant');
const { opentracingOpentelemetry } = require('../config/config.default');

module.exports = (config = opentracingOpentelemetry) => {
  const env = process.env.EGG_SERVER_ENV || process.env.DEPLOY_ENV || 'local';
  const {
    debug,
    simulate,
    serviceName,
    serviceId,
    companyName,
    samplerRatio,
  } = {
    ...opentracingOpentelemetry,
    ...config,
  };

  debug && console.debug('opentelemetry config:', env, { ...opentracingOpentelemetry, ...config })
  debug && diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName, // CMDB中应用名
      'service.id': serviceId, // CMDB中应用ID
      'company.id': companyName, // 保险固定为 10022 ，科技固定为 79002，子公司请咨询六翼
      env, // 部署物理环境code : test，pre，prd，pub}}   // ship 部署环境code
    }),
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(samplerRatio),
    }),
    spanProcessor: simulate
      ? new SimpleSpanProcessor(new ConsoleSpanExporter())
      : new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: traceUrl[env],
        }),
      ),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk
    .start()
    .then(() => {
      console.info('Tracing initialized');
    })
    .catch((error) => console.error('Error initializing tracing', error));

  return () => {
    sdk
      .shutdown()
      .then(() => console.info('Tracing terminated'))
      .catch((error) => console.error('Error terminating tracing', error));
  };
};
