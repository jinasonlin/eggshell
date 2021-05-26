module.exports = {
  get queryHelper() {
    return this.app.mongooseQueryHelper;
  },
  getQueryKeywords(Model, keywords) {
    return this.queryHelper.keywords(keywords, Model.KEYWORDS);
  },
  getQueryFilters(Model, filters, { allowFiltersFieldEmpty } = {}) {
    return this.queryHelper.filters(filters, Model.FILTERS, { allowEmpty: allowFiltersFieldEmpty });
  },
  getQueryFilter(Model, { id, keywords, filters, additionFilter, additionFilterMode } = {}, { allowFiltersFieldEmpty } = {}) {
    const filter = {};
    let _keywords;
    let _filters;

    if (id) {
      filter._id = id;
    }
    if (keywords) {
      _keywords = this.getQueryKeywords(Model, keywords);
    }
    if (filters) {
      _filters = this.getQueryFilters(Model, filters, { allowFiltersFieldEmpty });
    }

    additionFilter = Array.isArray(additionFilter) ? additionFilter : [additionFilter];

    if (!_keywords && !_filters && !additionFilter.length) return filter;

    switch (additionFilterMode) {
      case 'and':
        filter.$and = [_keywords, _filters, ...additionFilter].filter(Boolean);
        // Object.assign(filter, _keywords, _filters, {
        //   $and: additionFilter,
        // });
        break;
      case 'or':
        filter.$and = [_keywords, _filters, {
          $or: [...additionFilter].filter(Boolean),
        }].filter(Boolean);
        // Object.assign(filter, _keywords, _filters, {
        //   $or: additionFilter,
        // });
        break;
      default:
        Object.assign(filter, _keywords, _filters, ...additionFilter);
    }

    return filter;
  },
  getQueryConditions(
    Model,
    {
      id,
      keywords,
      filters,
      pageSize,
      currentPage,
      sort,
      select,
      customFilter,
      additionFilter,
      additionFilterMode,
    } = {},
    {
      queryMode,
      allowPageSizeZero,
      allowFiltersFieldEmpty,
    } = {},
  ) {
    const conditions = {
      filter: {},
    };

    switch (queryMode) {
      case 'load':
        conditions.sort = this.queryHelper.sort(sort);
        conditions.select = this.queryHelper.select(select);
        break;
      case 'count':
        break;
      case 'list':
      default:
        conditions.pageSize = this.queryHelper.pageSize(pageSize, { allowZero: allowPageSizeZero });
        conditions.currentPage = this.queryHelper.currentPage(currentPage);
        conditions.sort = this.queryHelper.sort(sort, Model.SORT);
        conditions.select = this.queryHelper.select(select, Model.SELECT);
        break;
    }

    if (customFilter) {
      Object.assign(conditions.filter, customFilter);
    } else {
      Object.assign(conditions.filter, this.getQueryFilter(Model, { id, keywords, filters, additionFilter, additionFilterMode }, { allowFiltersFieldEmpty }));
    }

    return conditions;
  },
};
