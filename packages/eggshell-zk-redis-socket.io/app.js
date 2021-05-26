const assert = require('assert');
const { Boot } = require('egg');
const redis = require('socket.io-redis');
const debug = require('debug')('egg-socket.io:lib:io.js:zk');

class PluginBoot extends Boot {
  async _getZooKeeperRedisRawData(config) {
    const client = this.app.zk.createClient(config.zkConnectionString);
    await client.ready();
    const data = await client.getData(config.redisConfigKey);
    const rawConfig = JSON.parse(Buffer.from(data).toString('utf8'));
    return rawConfig;
  }

  _getZooKeeperRedisConfig(rawConfig) {
    return {
      host: rawConfig.host,
      port: rawConfig.port,
      auth_pass: rawConfig.password,
      db: rawConfig.dbNo,
    };
  }

  configWillLoad() {
    delete this.config.io.redis;
  }

  async didLoad() {
    assert(this.app.io, '[egg-zk-socket.io-redis] egg-socket.io has not been initialized, please enable it.');

    const rawConfig = await this._getZooKeeperRedisRawData(this.config.zkRedisSocketIO);
    const config = this._getZooKeeperRedisConfig(rawConfig);

    // 具体情况 egg-socket.io/lib/io.js
    const adapter = redis(config);
    adapter.prototype.on('error', (err) => {
      this.app.coreLogger.error(err);
    });
    this.app.io.adapter(adapter);

    debug('[egg-socket.io] init socket.io-redis ready!');
  }
}

module.exports = PluginBoot;
