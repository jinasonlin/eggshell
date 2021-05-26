exports.opentracingJaeger = {
  reporter: {
    agentHost: 'svc-jaeger-agent.jaeger',
    agentPort: 6832,
  },
  sampler: {
    type: 'probabilistic',
    param: 0.5,
  },
};
