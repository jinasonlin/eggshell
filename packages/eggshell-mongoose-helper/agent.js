module.exports = (agent) => {
  if (agent.config.mongoose.agent) require('./lib/setup')(agent);
};
