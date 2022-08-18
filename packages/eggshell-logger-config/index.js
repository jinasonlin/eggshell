const path = require('path');
const fecha = require('fecha');

function bizFormatter(meta) {
  meta.time = fecha.format(Date.now(), 'YYYY-MM-DDTHH:mm:ss.SSS+08:00');
  try {
    const { message, ...rest } = meta;
    const messageObj = JSON.parse(meta.message);
    meta = { ...rest, ...messageObj };
  } catch (error) {
    // ignore
  }

  return JSON.stringify(meta);
}

module.exports = (appInfo) => {
  const appName = appInfo.name;

  const config = {};

  /**
   * 系统日志
   */
  config.logger = {
    dir: process.env.DEPLOY_ENV
      ? path.join('/', 'alidata1', 'admin', appName, 'logs')
      : path.join(appInfo.baseDir, 'logs'),
    appLogName: `app-web_app_${appName}_lt_info.log`,
    coreLogName: `app-core_app_${appName}_lt_info.log`,
    agentLogName: `agent_app_${appName}_lt_info.log`,
    errorLogName: `common_app_${appName}_lt_error.log`,
    level: 'INFO',
    consoleLevel: 'INFO',
    disableConsoleAfterReady: false,
    contextFormatter(meta) {
      const { traceId = '', spanId = '', parentId = '' } = meta.ctx.tracer || {};

      return `${meta.date} [${meta.pid}] ${meta.level} [ctx] [] [trace=${traceId},span=${spanId},parent=${parentId}] - ${meta.paddingMessage} ${meta.message}`;
    },
    formatter(meta) {
      // formatter 无法修改 app.coreLogger 和 app.logger 的 console transport 格式
      // 所以控制台输出的格式存在不一致，但文件日志可按照我们标准的格式进行定义

      return `${meta.date} [${meta.pid}] ${meta.level} [app] [] [trace=,span=,parent=] - ${meta.message}`;
    },
  };

  /**
   * 自定义日志
   * - 定时任务日志
   * - biz日志
   */
  config.customLogger = {
    scheduleLogger: {
      consoleLevel: 'NONE',
      file: `schedule_app_${appName}_lt_info.log`,
    },
    bizLogger: {
      consoleLevel: 'NONE',
      file: `common_app_${appName}_lt_biz.log`,
      contextFormatter: bizFormatter,
      formatter: bizFormatter,
    },
  };

  return config;
};
