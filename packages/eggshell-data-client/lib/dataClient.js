// 将简单问题复杂化，仅作为示例
// https://eggjs.org/zh-cn/advanced/cluster-client.html
// https://github.com/node-modules/cluster-client

const assert = require('assert');
const Base = require('sdk-base');

const DataCenter = new Map();
const OSSPubKey = new Map();

/**
 * cluster client 外部调用采用异步方式，这一点需要注意
 */

class DataClient extends Base {
  constructor(options) {
    assert(options.app, 'please provide app');
    super(options);
    this.app = options.app;
    this.ready(true);
  }

  subscribe({ key, immediate = true }, listener) {
    this.on(key, listener);

    if (immediate) {
      const data = DataCenter.get(key);
      if (data) {
        process.nextTick(() => listener(data));
      }
    }
  }

  publish({ key, data }) {
    if (key === 'LRU') {
      this.emit(key, data);
      return;
    }

    let changed = false;

    if (DataCenter.has(key)) {
      const result = DataCenter.get(key);
      if (result !== data) {
        changed = true;
        DataCenter.set(key, data);
      }
    } else {
      changed = true;
      DataCenter.set(key, data);
    }
    if (changed) {
      this.emit(key, data);
    }
  }

  async getData(key) {
    return DataCenter.get(key);
  }

  async getOSSPubKey(pubKeyUrl) {
    if (!pubKeyUrl.match(/^http[s]?:\/\/gosspublic\.alicdn\.com\//)) {
      return '';
    }

    let pubKey = OSSPubKey.get(pubKeyUrl);

    if (!pubKey) {
      const result = await this.app.curl(pubKeyUrl, { dataType: 'text' });
      pubKey = result.data;

      OSSPubKey.set(pubKeyUrl, pubKey);
    }

    return pubKey;
  }
}

module.exports = DataClient;
