# eggshell-zk-redis
调整`egg-redis`的配置，通过`zookeeper`获取。

## 依赖
- egg-zookeeper
- egg-redis

## Note
egg-redis 必须禁用！

```javascript
exports.redis = {
  enable: false,
  path: 'egg-redis',
};
```