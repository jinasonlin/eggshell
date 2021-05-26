const DataClient = require('./lib/dataClient');
const APIClient = require('./lib/apiClient');

module.exports = (app) => {
  app.dataClient = app.cluster(DataClient).create({ app });
  app.apiClient = new APIClient({ app });
};
