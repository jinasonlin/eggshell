const assert = require('assert');
const { APIClientBase } = require('cluster-client');
const LRU = require('ylru');
const DataClient = require('./dataClient');

const LRUCenter = new LRU(10);

class APIClient extends APIClientBase {
  constructor(options) {
    assert(options.app, 'please provide app');
    Object.assign(options, { cluster: options.app.cluster });
    super(options);
    this.app = options.app;

    const { subscribes = [] } = options;

    if (this.app.type !== 'agent' && this.app.options.mode !== 'single') {
      this.subscribeLRU();
    }

    this._cache = {};
    subscribes.forEach((key) => {
      this.subscribe(key, (value) => {
        this._cache[key] = value;
      });
    });
  }

  /**
   * @implements
   */
  get DataClient() {
    return DataClient;
  }

  /**
   * @implements
   */
  // get delegates() {
  //   return {
  //     getData: 'invoke',
  //   };
  // }

  /**
   * @implements
   */
  get clusterOptions() {
    return {
      name: 'APIClient',
    };
  }

  subscribe(key, listener) {
    this._client.subscribe({ key, immediate: false }, listener);
  }

  publish({ key, data }) {
    this._client.publish({ key, data });
  }

  getCache(key) {
    return this._cache[key];
  }

  _setLRUData(key, value) {
    LRUCenter.set(key, value, { maxAge: 10000 });
  }

  _publishLRU(key, value) {
    this.app.options.mode !== 'single' && this._client.publish({ key: 'LRU', data: { key, value } });
  }

  /**
   * works 共享订阅进程间数据
   */
  subscribeLRU() {
    this._client.subscribe({ key: 'LRU', immediate: false }, ({ key, value }) => {
      this._setLRUData(key, value);
    });
  }

  setLRUData(key, value) {
    this._setLRUData(key, value);
    this._publishLRU(key, value);
  }

  getLRUData(key) {
    return LRUCenter.get(key);
  }

  getLRUKeys() {
    return LRUCenter.keys();
  }
}

module.exports = APIClient;
