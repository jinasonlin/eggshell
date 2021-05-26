const queryHelper = require('./helper/query');
const generateFilters = require('./helper/generateFilters');
const globalPlugin = require('./plugins/global');
const queryPlugin = require('./plugins/query');
const virtualPlugin = require('./plugins/virtual');

module.exports = {
  // TODO 后续迭代删除
  queryHelper,
  schemaHelp: {
    globalPlugin,
    queryPlugin,
    virtualPlugin,
  },
  mongooseQueryHelper: queryHelper,
  mongooseSchemaHelper: {
    generateFilters,
  },
  mongooseSchemaPlugins: {
    globalPlugin,
    queryPlugin,
    virtualPlugin,
  },
};
