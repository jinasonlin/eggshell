const { Service } = require('egg');

class DebugService extends Service {
  async startInspector() {
    this.app.messenger.broadcast('startInspector');
  }

  async stopInspector() {
    this.app.messenger.broadcast('stopInspector');
  }

  async startDBProxy() {
    this.app.messenger.sendToAgent('startDBProxy');
  }

  async stopDBProxy() {
    this.app.messenger.sendToAgent('stopDBProxy');
  }
}

module.exports = DebugService;
