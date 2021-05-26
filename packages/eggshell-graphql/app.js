module.exports = (app) => {
  require('./lib/graphqlLoaderPatch')(app);
  require('./lib/graphql')(app);
};
