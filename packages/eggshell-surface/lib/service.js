const egg = require('egg');

const { Service } = egg;

/**
 * @interface
 */
class EggshellService extends Service {
  constructor(ctx, options = {}) {
    super(ctx);

    const { Model } = options;

    if (Model) {
      Object.defineProperty(this, '_Model', {
        get() {
          return Model;
        },
      });
    }
  }

  /**
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this
  get _Model() {
    throw new Error('override `get Model`');
  }

  /**
   * @param {(object|id)} filter id or filter
   */
  async exist(ops) {
    const filter = {};

    if (typeof ops !== 'object') {
      filter._id = ops;
    } else {
      Object.assign(filter, ops);
    }

    const bool = await this._Model.exists(filter);

    return bool;
  }

  /**
   * @param {(object|id)} filter id or filter or options.filter
   */
  async load(queryParams, { additionFilter, additionFilterMode } = {}, options) {
    queryParams = typeof queryParams === 'string' ? { id: queryParams } : queryParams;

    const conditions = this.ctx.helper.getQueryConditions(this._Model, {
      ...queryParams,
      additionFilter,
      additionFilterMode,
    }, {
      ...options,
      queryMode: 'load',
    });

    const doc = await this._Model.load(conditions, options);

    return doc;
  }

  /**
   * @param {*} queryParams.filter 自定义查询条件
   * @param {*} queryParams.keywords 查询关键字
   * @param {*} queryParams.filters 查询过滤
   */
  async count(queryParams, { additionFilter, additionFilterMode } = {}, options) {
    const filter = this.ctx.helper.getQueryFilter(this._Model, {
      ...queryParams,
      additionFilter,
      additionFilterMode,
    }, {
      ...options,
    });

    const count = await this._Model.countDocuments(filter);

    return count;
  }

  /**
   * @param {*} queryParams.filter 自定义查询条件
   * @param {*} queryParams.keywords 查询关键字
   * @param {*} queryParams.filters 查询过滤
   * @param {*} queryParams.select
   * @param {*} queryParams.pageSize 每页
   * @param {*} queryParams.currentPage 分页
   */
  async list(queryParams, { additionFilter, additionFilterMode } = {}, options) {
    const conditions = this.ctx.helper.getQueryConditions(this._Model, {
      ...queryParams,
      additionFilter,
      additionFilterMode,
    }, {
      ...options,
      queryMode: 'list',
    });

    const docs = await this._Model.list(conditions, options);

    return docs;
  }

  /**
   * @param {*} body 创建内容
   */
  async create(createBody) {
    const doc = this._Model.create(createBody);

    return doc;
  }

  async createMany(array) {
    const docs = this._Model.insertMany(array);

    return docs;
  }

  /**
   * @param {*} id 查询条件
   * @param {*} update 更新内容
   */
  async update(id, updateBody) {
    const result = await this._Model.updateOne({ _id: id }, updateBody, { runValidators: true });

    return result;
  }

  /**
   * @param {*} filter 查询条件
   */
  async destroy(id) {
    const result = await this._Model.deleteOne({ _id: id });

    return result;
  }
}

module.exports = EggshellService;
