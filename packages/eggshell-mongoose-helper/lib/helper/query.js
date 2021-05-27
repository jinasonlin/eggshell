/* eslint-disable no-restricted-globals */
/* eslint-disable prefer-destructuring */
const moment = require('moment');

function escapeRegExp(str) {
  if (str && str.toString) str = str.toString();
  if (typeof str !== 'string' || !str.length) return '';
  // eslint-disable-next-line
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

exports.currentPage = (currentPage = 1) => {
  const current = +currentPage;
  if (!current || current < 0) {
    return 0;
  }
  return current - 1;
};

exports.pageSize = (pageSize = 10, { allowZero = false } = {}) => {
  const size = +pageSize;
  if (size < 0 || (size === 0 && !allowZero)) {
    return 10;
  }
  if (size > 1000) {
    return 1000;
  }
  return size;
};

const filterHelp = {
  default(filter) {
    let value = filter;
    let all = true;
    let inverse = false;
    let result;

    if (typeof filter === 'object' && !Array.isArray(filter)) {
      value = filter.value;
      all = !(filter.all === false || filter.all === 'false');
      inverse = filter.inverse === true || filter.inverse === 'true';
    }

    if (value) {
      result = {};
      let operator;
      if (Array.isArray(filter)) {
        operator = all ? '$all' : '$in';
        operator = inverse ? '$nin' : operator;
        result[operator] = value;
      } else {
        operator = inverse ? '$ne' : '$eq';
        result[operator] = value;
      }
    } else if (inverse) {
      result = { $nin: ['', null] };
    } else {
      result = { $in: ['', null] };
    }

    return result;
  },
  string(filter) {
    // 取消正则匹配
    let lite = true;
    let exact = false;
    let inverse = false;
    let value = filter;
    let result;

    if (typeof filter === 'object') {
      value = filter.value;
      exact = filter.exact !== true && filter.exact !== 'true';
      inverse = filter.inverse === true || filter.inverse === 'true';
      lite = !(filter.lite === false || filter.lite === 'false');
      if (typeof filter.exact !== 'undefined' || typeof filter.inverse !== 'undefined') {
        lite = false;
      }
    }

    if (value) {
      if (lite) {
        result = value;
      } else if (exact) {
        result = new RegExp(`^${escapeRegExp(value)}$`, 'i');
      } else {
        result = new RegExp(escapeRegExp(value), 'i');
      }
      if (inverse) {
        result = { $not: result };
      }
    } else if (inverse) {
      result = { $nin: ['', null] };
    } else {
      result = { $in: ['', null] };
    }

    return result;
  },
  boolean(filter) {
    let value = filter;
    let inverse = false;
    let result;

    if (typeof filter === 'object' && filter.value) {
      value = filter.value;
      inverse = filter.inverse === true || filter.inverse === 'true';
    }
    if (typeof value === 'string') {
      value = (value === 'true');
    } else {
      value = Boolean(value);
    }

    if (inverse) {
      result = { $ne: value };
    } else {
      result = value;
    }

    return result;
  },
  number(filter) {
    let value;
    let start;
    let end;

    if (typeof filter === 'object' && filter.value) {
      value = filter.value;
    } else if (typeof filter === 'number' || typeof filter === 'string') {
      value = filter;
    }
    if (value !== undefined) {
      value = parseFloat(value);
      return isNaN(value) ? undefined : value;
    }

    // 区间
    let bt;
    if (Array.isArray(filter)) {
      bt = filter;
    } else if (filter.$bt && Array.isArray(filter.$bt)) {
      bt = filter.$bt;
    } else if (filter.bt && Array.isArray(filter.bt)) {
      bt = filter.bt;
    }
    if (bt && bt.length === 2) {
      start = parseFloat(bt[0]);
      end = parseFloat(bt[1]);
      if (isNaN(start) || isNaN(end)) return;
      return { $gte: start, $lte: end };
    }

    // 比较
    ['gt', 'gte', 'lt', 'lte'].forEach((key) => {
      let val = filter[key] || filter[`$${key}`];
      if (val === undefined) return;
      val = parseFloat(val);
      if (isNaN(val)) return;
      if (!value) {
        value = {};
      }
      value[`$${key}`] = val;
    });
    if (value) {
      return value;
    }
  },
  datetime(filter) {
    if (!filter) return;
    let value;
    let exact = false;
    let result;

    if (typeof filter === 'string' || typeof filter === 'number' || filter instanceof Date) {
      value = filter;
    } else if (typeof filter === 'object' && filter.value) {
      value = filter.value;
      exact = filter.exact !== true && filter.exact !== 'true';
    }

    // 当天
    if (!exact && value) {
      value = moment(value);
      if (!value.isValid()) return;
      const start = moment(value).startOf('day').toDate();
      const end = moment(value).endOf('day').toDate();
      result = { $lte: end, $gte: start };
      return result;
    }

    // 区间
    let bt;
    if (Array.isArray(filter)) {
      bt = filter;
    } else if (filter.$bt && Array.isArray(filter.$bt)) {
      bt = filter.$bt;
    } else if (filter.bt && Array.isArray(filter.bt)) {
      bt = filter.bt;
    }
    if (bt && bt.length === 2) {
      const start = moment(bt[0]);
      const end = moment(bt[1]);
      if (!start.isValid() || !end.isValid()) return;
      if (exact) {
        result = {
          $gte: start.toDate(),
          $lte: end.toDate(),
        };
      } else {
        result = {
          $gte: start.startOf('day').toDate(),
          $lte: end.endOf('day').toDate(),
        };
      }
      return result;
    }

    // 比较
    ['gt', 'gte', 'lt', 'lte'].forEach((key) => {
      let val = filter[key] || filter[`$${key}`];
      if (val) {
        val = moment(val);
        if (!val.isValid()) return;
        if (key[0] === 'g') {
          // $gt $gte
          if (exact) {
            val = val.toDate();
          } else {
            val = val.startOf('day').toDate();
          }
        } else {
          // $lt $lte
          // eslint-disable-next-line
          if (exact) {
            val = val.toDate();
          } else {
            val = val.endOf('day').toDate();
          }
        }
        if (!result) {
          result = {};
        }
        value[`$${key}`] = val;
      }
    });

    if (result) {
      return result;
    }
  },
};

exports.filters = (filters, fields, { allowEmpty = false }) => {
  if (!filters || !fields) return;

  const result = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (!value && !allowEmpty) {
      return;
    }
    let fieldFilter = fields && fields[key] ? fields[key] : 'default';
    if (key === 'createdAt') {
      fieldFilter = 'datetime';
    }
    const filter = filterHelp[fieldFilter](value);
    if (filter !== undefined) {
      result[key] = filter;
    }
  });
  return result;
};

exports.keywords = (keywords, fields) => {
  if (!keywords || !fields || !fields.length) return;

  let value = keywords;
  let all = true;
  let result;
  if (typeof keywords === 'object') {
    value = keywords.value;
    all = !(keywords.all === 'false' || keywords.all === false);
  }
  if (typeof value === 'string') {
    value = value.trim();
  }
  if (!value || typeof value !== 'string') return;

  const words = value.split(/\s+/);
  const keywordsFilters = [];
  let rx;
  if (words.length > 1) {
    if (all) {
      rx = words.map((item) => {
        return new RegExp(escapeRegExp(item), 'i');
      });
    } else {
      rx = new RegExp(words.map((item) => {
        return escapeRegExp(item);
      }).join('|'), 'i');
    }
  } else {
    all = false;
    rx = new RegExp(escapeRegExp(value), 'i');
  }
  fields.forEach((field) => {
    const filter = {};
    if (all) {
      filter.$and = [];
      rx.forEach((_rx) => {
        const _filter = {};
        _filter[field] = _rx;
        filter.$and.push(_filter);
      });
    } else {
      filter[field] = rx;
    }
    keywordsFilters.push(filter);
  });
  if (keywordsFilters.length === 1) {
    result = keywordsFilters[0];
  } else {
    result = {
      $or: keywordsFilters,
    };
  }
  return result;
};

exports.select = (select, defaultSelect) => {
  let result = defaultSelect;

  if (!select) {
    return result;
  }

  if (Array.isArray(select)) {
    result = [];
    select.forEach((value) => {
      if (typeof value === 'string') {
        result.push(value);
      }
    });
  } else if (typeof select === 'object') {
    result = {};
    Object.entries(select).forEach(([key, value]) => {
      if (~[0, 1].indexOf(value)) {
        result[key] = value;
      } else if (~['0', '1'].indexOf(value)) {
        result[key] = Number(value);
      }
    });
  } else {
    result = select;
  }

  return result;
};

exports.sort = (sort, defaultSort) => {
  let result = defaultSort;

  if (!sort) {
    return result;
  }

  if (Array.isArray(sort)) {
    result = {};
    for (let i = 0; i < sort.length; i += 1) {
      if (sort[i].length > 1) {
        if (sort[i][0] === '-') {
          result[sort[i].substr(1)] = -1;
        } else {
          result[sort[i]] = 1;
        }
      }
    }
  } else if (typeof sort === 'object') {
    result = {};
    Object.entries(sort).forEach(([key, value]) => {
      if (~['asc', 'desc', 'ascending', 'descending', 1, -1].indexOf(value)) {
        result[key] = value;
      } else if (~['1', '-1'].indexOf(value)) {
        result[key] = Number(value);
      }
    });
  } else {
    result = sort;
  }

  return result;
};
