const assert = require('assert');
const { Boot } = require('egg');
const redis = require('egg-redis/lib/redis');
const redisDefaultConfig = require('egg-redis/config/config.default');

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
      password: rawConfig.password,
      db: rawConfig.dbNo,
    };
  }

  async didLoad() {
    assert(!this.app.plugins.redis || !this.app.plugins.redis.enable, '[egg-zk-redis] egg-redis is enable, please disable it.');
    assert(!this.app.redis, '[egg-zk-redis] egg-redis has been initialized, please disable it.');

    const config = this.config.zkRedis;
    assert(!(config.client && config.clients), '[egg-zk-redis] can not set options.client and options.clients both');

    if (!this.config.redis) {
      // load default redis config
      this.config.redis = redisDefaultConfig;
    }

    // sigle client
    if (config.client) {
      const zkConfig = { ...config.default, ...config.client };
      const rawConfig = await this._getZooKeeperRedisRawData(zkConfig);

      this.config.redis.client = {
        ...this.config.redis.client,
        ...this._getZooKeeperRedisConfig(rawConfig),
      };
      redis(this.app);
      return;
    }

    // multi client
    if (config.clients) {
      await Promise.all(Object.keys(config.clients).map(async (id) => {
        const zkConfig = { ...config.default, ...config.clients[id] };
        const rawConfig = await this._getZooKeeperRedisRawData(zkConfig);

        if (!this.config.redis.clients) {
          // set default redis clients
          this.config.redis.clients = {};
        }
        this.config.redis.clients[id] = {
          ...this.config.redis.clients[id],
          ...this._getZooKeeperRedisConfig(rawConfig),
        };
      }));
      redis(this.app);
      return;
    }

    this.logger.warn('[egg-zk-redis] please validate you config');
  }

  async willReady() {
    const { env, redis: config } = this.config;

    if (env === 'local') return;

    if (config.client) {
      const keys = await this.app.redis.keys('cache:*');
      keys && keys.length && await this.app.redis.del(keys);
      this.logger.debug('willReady get keys', keys);
      return;
    }

    if (config.clients) {
      Object.keys(config.clients).forEach(async (id) => {
        const keys = await this.app.redis[id].keys('cache:*');
        keys && keys.length && await this.app.redis[id].del(keys);
        this.logger.debug(`willReady get keys [${id}]`, keys);
      });
      return;
    }

    this.logger.warn('[egg-zk-redis] please validate you config');
  }
}

module.exports = PluginBoot;
