const generateFilters = require('../helper/generateFilters');

module.exports = function query(schema, { disableGenerateFilters = false } = {}) {
  schema.statics.findId = function findId(filter) {
    return this.findOne(filter).select({ _id: 1 }).lean().then((doc) => doc && doc._id);
  };

  schema.statics._load = function _load(conditions = {}, options = {}) {
    const filter = conditions.filter || {};
    const select = conditions.select || undefined;
    const sort = conditions.sort || undefined;
    const lean = Boolean(options.lean);

    return this.findOne(filter).select(select).sort(sort).lean(lean);
  };

  schema.statics._list = function _list(conditions = {}, options = {}) {
    const filter = conditions.filter || {};
    const select = conditions.select || undefined;
    const sort = conditions.sort || undefined;
    const currentPage = typeof conditions.currentPage === 'number' ? conditions.currentPage : undefined;
    const pageSize = typeof conditions.pageSize === 'number' ? conditions.pageSize : undefined;
    const lean = Boolean(options.lean);

    return this.find(filter)
      .select(select)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * currentPage)
      .lean(lean);
  };

  schema.statics.load = function load(conditions, options) {
    return this._load(conditions, options).exec();
  };

  schema.statics.list = function list(conditions, options) {
    return this._list(conditions, options).exec();
  };

  if (!disableGenerateFilters && !schema.statics.FILTERS) {
    schema.statics.FILTERS = generateFilters(schema);
  }
};
