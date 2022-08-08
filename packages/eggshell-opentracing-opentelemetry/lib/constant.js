exports.tracerName = 'opentelemetry-opentracing-shim';

exports.traceUrl = {
  local: 'http://172.28.34.35:4318/v1/traces',
  test: 'http://otel-collector-http-test.za-tech.net/v1/traces',
  uat: 'http://otel-collector-http-pre.za-tech.net/v1/traces',
  prd: 'http://otel-collector-http-pub.za-tech.net/v1/traces',
};
