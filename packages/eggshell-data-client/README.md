data-client vs api-client
---

> https://eggjs.org/zh-cn/advanced/cluster-client.html  
> https://github.com/node-modules/cluster-client  

`data-client`作为一个共享调度中心（依托于`cluster-client`），其所有数据均来之`cluster-client leader`。
`api-client`进一步脱离了多进程模型。他起到一个桥梁作用，为当前进程在`data-client`之上提供独立接口、缓存等，方便业务调用。

举个例子，假设`data-client`现在是一个缓存中心，所有数据都存放在内存中。利用`cluster-client`创建出来的`dataClient`就可以在多个进程间共同维护和消费这个缓存，而且`follower`的内存是不会保存这些数据。如果在进一步包装`api-client`提供本地缓存作为同步调用，那么每个进程都会包含一个本地缓存。


### 备注

#### 1
开发时，观察 `cluster-client`，发现 `leader` 和 `follower` 心跳超时时（如系统待机挂起时），会出现两条错误日志。
其中一条时 egg 的 logger 打印出来的。但另一条却让人摸不着头脑。
通过逐步观察代码，其实是 `leader` 继承自 `sdk-base`，而父类默认添加了一个 `on('error')` `_defaultErrorHandler`。所以才会出现这条日志信息。
其中 `leader` 中的成员 `connection` 也继承自 `sdk-base`，但是自定义了 `on('error')`，所以没有额外出现一条日志信息。
