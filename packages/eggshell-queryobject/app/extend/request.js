const qs = require('qs');

const QS_CACHE = Symbol('Request#qsCache');

module.exports = {
  get queryobject() {
    const str = this.querystring;
    const cache = this[QS_CACHE] = this[QS_CACHE] || {};
    const queryobject = cache[str] || (cache[str] = qs.parse(str));
    return queryobject;
  },
};
