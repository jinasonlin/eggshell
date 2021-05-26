module.exports = (app) => {
  if (app.config.mongoose.app) require('./lib/setup')(app);
};
