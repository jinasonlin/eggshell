module.exports = (app) => {
  /**
   * base file_loader defaultCamelize
   */
  function dirname(filepath, caseStyle) {
    const properties = filepath.substring(0, filepath.lastIndexOf('.')).split('/').slice(0, -1);
    return properties.map((property) => {
      if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
        throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
      }

      property = property.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());
      let first = property[0];
      switch (caseStyle) {
        case 'lower':
          first = first.toLowerCase();
          break;
        case 'upper':
          first = first.toUpperCase();
          break;
        case 'camel':
        default:
      }
      return first + property.substring(1);
    });
  }

  app.loader.loadGraphql = function loadGraphql(directory, opt) {
    opt = {
      directory,
      target: opt.target || {},
      inject: this.app,
      ...opt,
      caseStyle: (filepath) => dirname(filepath, opt.caseStyle),
    };

    const timingKey = `Load graphql [${opt.match}]`;
    this.timing.start(timingKey);
    new this.FileLoader(opt).load();
    this.timing.end(timingKey);
  };

  app.loader.loadGraphqlConnectorToContext = function loadGraphqlConnectorToContext(directory, property = 'connector', opt) {
    opt = {
      match: `**/${property}.js`,
      fieldClass: 'connectorClasses',
      ...opt,
      caseStyle: (filepath) => dirname(filepath, opt.caseStyle),
    };

    this.app.loader.loadToContext(directory, property, opt);
  };
};
