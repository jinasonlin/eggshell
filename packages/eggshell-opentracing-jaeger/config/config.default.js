exports.opentracingJaeger = {
  reporter: {
    agentHost: '172.28.32.92',
    agentPort: 6832,
  },
  sampler: {
    type: 'const',
    param: 1,
  },
};
