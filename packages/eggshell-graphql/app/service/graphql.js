const { Service } = require('egg');
const { execute, formatError } = require('graphql');
const gql = require('graphql-tag');

class GraphqlService extends Service {
  get logger() {
    return this.app.getLogger('graphqlLogger');
  }

  async query(requestString) {
    let result = {};

    try {
      const params = JSON.parse(requestString);
      const { query, variables, operationName } = params;
      // GraphQL source.
      // https://github.com/apollostack/graphql-tag#caching-parse-results
      const documentAST = gql`
        ${query}
      `;
      const context = this.ctx;
      const { schema } = this.app;

      // http://graphql.org/graphql-js/execution/#execute
      result = await execute(
        schema,
        documentAST,
        null,
        context,
        variables,
        operationName,
      );

      // Format any encountered errors.
      /* istanbul ignore if */
      if (result && result.errors) {
        result.errors = result.errors.map(formatError);
      }
    } catch (e) {
      this.logger.error(e);

      result = {
        data: {},
        errors: [e],
      };
    }

    return result;
  }
}

module.exports = GraphqlService;
