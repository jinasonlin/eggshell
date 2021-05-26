const url = require('url');

const HOST = Symbol('HOST');

function getRealHost(host) {
  let realHost = host;

  if (host) {
    try {
      const obj = url.parse(host);

      obj.host && (realHost = obj.host);
    } catch (e) {
      // ignore
    }
  }

  return realHost;
}

module.exports = {
  get boomHost() {
    if (this[HOST]) return this[HOST];

    this[HOST] = this.get('originalDomain') || getRealHost(this.get('walmart-target')) || this.get('x-forwarded-host') || this.get('host');

    return this[HOST];
  },
};
