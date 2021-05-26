const egg = require('egg');
const { surface: defaultConfig } = require('../config/config.default');
const handleOption = require('../utils/handleOption');
// const EggshellService = require('./service');

// const CONTROLLER_CONTEXT_SERVICE = Symbol('eggshell#controllerContextService');

const { Controller } = egg;

/**
 * @interface
 */
class EggshellController extends Controller {
  // /**
  //  * @abstract
  //  */
  // get _Model() {
  //   return undefined;
  // }

  /**
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this
  get _service() {
    // if (this._Model) {
    //   if (!this.ctx[CONTROLLER_CONTEXT_SERVICE]) {
    //     this.ctx[CONTROLLER_CONTEXT_SERVICE] = new EggshellService(this.ctx, {
    //       Model: this._Model,
    //     });
    //   }
    //   return this.ctx[CONTROLLER_CONTEXT_SERVICE];
    // }
    // throw new Error('override `get _service` or `get _Model`');

    throw new Error('override `get _service`');
  }

  get _surfaceConfig() {
    return this.ctx.app.config.surface || defaultConfig;
  }

  get _userstampsConfig() {
    return this._surfaceConfig.userstamps;
  }

  /**
   * @abstract
   */
  get id() {
    return this.ctx.params.id;
  }

  async list() {
    const { request: { queryobject } } = this.ctx;
    const { pageSize, currentPage, select, sort, keywords, filters } = queryobject;

    const [count, docs] = await Promise.all([
      this._service.count({ keywords, filters }),
      this._service.list({ pageSize, currentPage, select, sort, keywords, filters }),
    ]);

    this.ctx.success({
      totalItem: count,
      resultList: docs,
    });
  }

  async index() {
    const { request: { queryobject } } = this.ctx;
    const { pageSize, currentPage, select, sort, keywords, filters } = queryobject;
    const additionFilter = { isDeleted: { $ne: true } };

    const [count, docs] = await Promise.all([
      this._service.count({ keywords, filters }, { additionFilter }),
      this._service.list(
        { pageSize, currentPage, select, sort, keywords, filters },
        { additionFilter },
      ),
    ]);

    this.ctx.success({
      totalItem: count,
      resultList: docs,
    });
  }

  async show() {
    const doc = await this._service.load(this.id);

    this.ctx.success(doc);
  }

  async create() {
    const { body } = this.ctx.request;

    const userId = handleOption(this._userstampsConfig, 'userId');
    const createdBy = handleOption(this._userstampsConfig, 'createdBy');

    let userBody;
    if (createdBy && userId && this.ctx[userId]) {
      userBody = {
        createdBy: this.ctx[userId],
      };
    }

    const doc = await this._service.create({ ...userBody, ...body });

    this.ctx.success(doc);
  }

  async update() {
    const { body } = this.ctx.request;

    const userId = handleOption(this._userstampsConfig, 'userId');
    const updatedBy = handleOption(this._userstampsConfig, 'updatedBy');

    let userBody;
    if (updatedBy && userId && this.ctx[userId]) {
      userBody = {
        updatedBy: this.ctx[userId],
      };
    }

    await this._service.update(this.id, { ...userBody, ...body });

    this.ctx.success();
  }

  async destroy() {
    await this._service.destroy(this.id);

    this.ctx.success();
  }
}

module.exports = EggshellController;
