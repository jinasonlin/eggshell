/* eslint-disable no-use-before-define */
const path = require('path');
const { merge, isFunction, isEmpty } = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');
const { typeDefs: scalarTypeDefs, resolvers: scalarResolvers } = require('graphql-scalars');

const SYMBOL_SCHEMA = Symbol('Application#schema');
const SYMBOL_DATASOURCE = Symbol('Application#datasource');

module.exports = (app) => {
  const { defaultTypeDefsEnabled, defaultTypeDefs } = app.config.graphql;
  const directory = path.join(app.baseDir, 'app/graphql');
  // const directiveResolvers = {};
  // const schemaDirectives = {};
  const typeDefs = [...scalarTypeDefs];
  const resolvers = { ...scalarResolvers };
  const dataSources = {};

  Object.defineProperty(app, 'GraphQLSchema', {
    get() {
      if (!this[SYMBOL_SCHEMA]) {
        this[SYMBOL_SCHEMA] = makeExecutableSchema({
          typeDefs,
          resolvers,
        });
      }
      return this[SYMBOL_SCHEMA];
    },
  });

  Object.defineProperty(app, 'GraphQLDataSources', {
    get() {
      if (!this[SYMBOL_DATASOURCE] && !isEmpty(dataSources)) {
        this[SYMBOL_DATASOURCE] = () => {
          return Object.entries(dataSources).reduce((prev, [key, Class]) => {
            return merge(prev, { [key]: new Class() });
          }, {});
        };
      }
      return this[SYMBOL_DATASOURCE];
    },
  });

  // load TypeDefs
  if (defaultTypeDefsEnabled && defaultTypeDefs) {
    typeDefs.push(defaultTypeDefs);
  }
  app.loader.loadGraphql(directory, {
    match: '**/schema.graphql',
    initializer: (obj) => {
      typeDefs.push(obj.toString('utf8'));
    },
  });

  // load resolver
  app.loader.loadGraphql(directory, {
    match: '**/resolver.js',
    initializer: (obj) => {
      if (isFunction(obj)) {
        obj = obj(this.app);
      }
      merge(resolvers, obj);
    },
  });

  // load data source
  app.loader.loadGraphql(directory, {
    match: '**/datasource.js',
    initializer: (obj, { pathName }) => {
      const key = pathName.split('.').pop();
      merge(dataSources, { [key]: obj });
    },
  });

  // load connector
  app.loader.loadGraphqlConnectorToContext(directory, 'connector', {
    caseStyle: 'lower',
  });
};
