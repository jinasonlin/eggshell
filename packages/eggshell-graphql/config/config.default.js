module.exports = (appInfo) => {
  const appName = appInfo.name;
  const config = {};

  config.graphql = {
    router: '/graphql',
    // 是否加载到 app 上，默认开启
    // app: true,
    // 是否加载到 agent 上，默认关闭
    // agent: false,

    // graphQL 路由前的拦截器
    // onPreGraphQL: async (ctx) => {},
    // playground 路由前的拦截器，建议用于做权限操作(如只提供开发者使用)
    // onPrePlayground: async (ctx) => {}

    defaultTypeDefsEnabled: true,
    defaultTypeDefs: `
      type Query
      type Mutation
    `,

    // apollo server 的配置，除 `schema` `context` 外均可配置
    // 详见 https://www.apollographql.com/docs/apollo-server/api/apollo-server
    // apolloServerOptions: {
    //   rootValue, // the value passed to the first resolve function
    //   formatError, // a function to apply to every error before sending the response to clients
    //   validationRules, // additional GraphQL validation rules to be applied to client-specified queries
    //   formatParams, // a function applied for each query in a batch to format parameters before execution
    //   formatResponse, // a function applied to each response after execution
    //   tracing, // when set to true, collect and expose trace data in the Apollo Tracing format
    //   logFunction, // a function called for logging events such as execution times
    //   fieldResolver, // a custom default field resolver
    //   debug, // a boolean that will print additional debug logging if execution errors occur
    //   cacheControl, // when set to true, enable built-in support for Apollo Cache Control
    //   subscriptions, // String defining the path for subscriptions or an Object to customize the subscriptions server. Set to false to disable subscriptions
    //   playground, // GraphQL Playground 开发工具配置，详见 https://github.com/prisma/graphql-playground#usage
    //   // ...
    // },
    // getApolloServerOptions: (app) => {}
  };

  config.customLogger = {
    graphqlLogger: {
      consoleLevel: 'NONE',
      file: `graphql_app_${appName}_lt_all.log`,
    },
  };

  return config;
};
