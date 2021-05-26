/* eslint-disable class-methods-use-this */
const EggshellService = require('../service');

class DiscriminatorService extends EggshellService {
  /**
   * @abstract
   */
  get _discriminatorKey() {
    throw new Error('override `get _discriminatorKey`');
  }

  /**
   * @override
   */
  async exist(discriminatorValue, ops) {
    const filter = {
      [this._discriminatorKey]: discriminatorValue,
    };

    if (typeof ops !== 'object') {
      filter._id = ops;
    } else {
      Object.assign(filter, ops);
    }

    const bool = await super.exist(filter);

    return bool;
  }

  /**
   * @override
   */
  async load(discriminatorValue, id, { additionFilter, additionFilterMode = 'and' } = {}) {
    additionFilter = {
      ...additionFilter,
      [this._discriminatorKey]: discriminatorValue,
    };

    const doc = await super.load(id, { additionFilter, additionFilterMode });

    return doc;
  }

  /**
   * @override
   */
  async count(discriminatorValue, queryParams, { additionFilter, additionFilterMode = 'and' } = {}) {
    additionFilter = {
      ...additionFilter,
      [this._discriminatorKey]: discriminatorValue,
    };

    const count = await super.count(queryParams, {
      additionFilter,
      additionFilterMode,
    });

    return count;
  }

  /**
   * @override
   */
  async list(discriminatorValue, queryParams, { additionFilter, additionFilterMode = 'and' } = {}, options) {
    additionFilter = {
      ...additionFilter,
      [this._discriminatorKey]: discriminatorValue,
    };

    const docs = await super.list(
      queryParams,
      {
        additionFilter,
        additionFilterMode,
      },
      options,
    );

    return docs;
  }

  /**
   * @override
   */
  async update(discriminatorValue, id, updateBody) {
    const result = await this._Model.updateOne(
      {
        [this._discriminatorKey]: discriminatorValue,
        _id: id,
      },
      updateBody,
      {
        runValidators: true,
        context: 'query',
      },
    );

    return result;
  }

  /**
   * @override
   */
  async destroy(discriminatorValue, id) {
    const result = await this._Model.deleteOne({
      [this._discriminatorKey]: discriminatorValue,
      _id: id,
    });

    return result;
  }
}

module.exports = DiscriminatorService;
