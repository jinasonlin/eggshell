egg-graphql
---

借鉴 [egg-graphql](https://github.com/eggjs/egg-graphql) & [@switchdog/egg-graphql](https://github.com/Carrotzpc/egg-graphql)

- 改造 `loader`  
- 暂不支持 `directiveResolvers` 和 `schemaDirectives` 加载  
  - 参考链接 [graphql-tools schema-directives](https://www.apollographql.com/docs/graphql-tools/schema-directives/)
  - `directiveResolvers` [_directive.resolver.js_]  
  - `schemaDirectives` [_directive.js_]  
    通过继承 `SchemaDirectiveVisitor`，通过对象导出。参考 [apollo-server](https://www.apollographql.com/docs/apollo-server/features/directives/) [egg-graphql](https://github.com/eggjs/egg-graphql/blob/master/test/fixtures/apps/graphql-app/app/graphql/directives/directive.js)  
- 暂不支持 `Subscriptions`