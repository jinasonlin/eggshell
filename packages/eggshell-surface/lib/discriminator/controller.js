/* eslint-disable class-methods-use-this */
const egg = require('egg');

const { Controller } = egg;

/**
 * @interface
 */
class EggshellController extends Controller {
  /**
   * @abstract
   */
  get _service() {
    throw new Error('override `get _service`');
  }

  /**
   * @abstract
   */
  get id() {
    return this.ctx.params.id;
  }

  /**
   * @abstract
   */
  get discriminatorId() {
    throw new Error('override `discriminatorId`');
  }

  async list() {
    const { request: { queryobject } } = this.ctx;
    const { pageSize, currentPage, select, sort, keywords, filters } = queryobject;

    const [count, docs] = await Promise.all([
      this._service.count(this.discriminatorId, { keywords, filters }),
      this._service.list(this.discriminatorId, { pageSize, currentPage, select, sort, keywords, filters }),
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
      this._service.count(this.discriminatorId, { keywords, filters }, { additionFilter }),
      this._service.list(
        this.discriminatorId,
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
    const doc = await this._service.load(this.discriminatorId, this.id);

    this.ctx.success(doc);
  }

  async create() {
    const { request: { body }, userId } = this.ctx;

    const doc = await this._service.create({ ...body, createdBy: userId });

    this.ctx.success(doc);
  }

  async update() {
    const { request: { body }, userId } = this.ctx;

    await this._service.update(this.discriminatorId, this.id, { ...body, lastModifiedBy: userId });

    this.ctx.success();
  }

  async destroy() {
    await this._service.destroy(this.discriminatorId, this.id);

    this.ctx.success();
  }
}

module.exports = EggshellController;
