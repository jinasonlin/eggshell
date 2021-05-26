const { ApolloServer } = require('apollo-server-koa');
const { get } = require('lodash');
const compose = require('koa-compose');
const { getApolloServerOptionsFromApp } = require('../../lib/utils');

module.exports = (_, app) => {
  const logger = app.getLogger('graphqlLogger');
  const options = app.config.graphql;
  const graphQLRouter = options.router || '/graphql';
  // apollo server options
  const apolloServerOptions = {
    formatError: (error) => {
      const code = get(error, 'extensions.code', '');
      const stacktrace = get(error, 'extensions.exception.stacktrace', []).join('\n');
      if (code === 'INTERNAL_SERVER_ERROR') {
        logger.error('[egg-graphql]', code, stacktrace);
      } else {
        logger.warn('[egg-graphql]', code, stacktrace);
      }
      return error;
    },
    ...getApolloServerOptionsFromApp(app),
    schema: app.GraphQLSchema,
    dataSources: app.GraphQLDataSources,
    context: ({ ctx }) => {
      return ctx;
    },
  };
  // apollo pre middleware
  const onPreMiddleware = async (ctx, next) => {
    const { onPreGraphQL, onPrePlayground } = options;
    const { playground } = apolloServerOptions;
    // playgroundEnabled 判断逻辑参考 apollo-server-core/playground/createPlaygroundOptions
    const playgroundEnabled = typeof playground !== 'undefined' ? !!playground : (process.env.NODE_ENV !== 'production');

    if (ctx.path === graphQLRouter) {
      const isHtml = ctx.request.accepts(['json', 'html']) === 'html';

      switch (true) {
        case (isHtml && playgroundEnabled && !!onPrePlayground): {
          await onPrePlayground(ctx, next);
          break;
        }
        case !!onPreGraphQL: {
          await onPreGraphQL(ctx, next);
          break;
        }
        default:
          await next();
      }
    } else {
      await next();
    }
  };
  // apollo server & middleware
  const apolloServer = new ApolloServer(apolloServerOptions);
  const apolloServerMiddleware = apolloServer.getMiddleware({ path: graphQLRouter });

  return compose([onPreMiddleware, apolloServerMiddleware]);
};
