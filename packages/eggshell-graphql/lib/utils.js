exports.getApolloServerOptionsFromApp = (app) => {
  const { apolloServerOptions, getApolloServerOptions } = app.config.graphql;
  return {
    ...apolloServerOptions,
    ...(typeof getApolloServerOptions === 'function' && getApolloServerOptions(app)),
  };
};
