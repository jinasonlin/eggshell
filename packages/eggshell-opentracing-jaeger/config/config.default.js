exports.opentracingJaeger = {
  reporter: {
    agentHost: '172.27.62.130',
    agentPort: 6832,
  },
  sampler: {
    type: 'const',
    param: 1,
  },
};
