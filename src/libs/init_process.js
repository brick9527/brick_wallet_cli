const config = require('../../config.json');

const getLogger = require('../util/log4js').getLogger;
const logger = getLogger('init_process');
const getProxyConfig = require('./get_proxy');
const getSpotClient = require('../util/binance_spot_client');

function initProcess(process, processName = 'default') {
  if (process.brickWalletCli) {
    logger.warn(`已经初始化process：${process.brickWalletCli.name}, 跳过本次初始化`);
    return;
  }
  
  logger.debug('开始初始化进程数据...');

  const proxyConfig = getProxyConfig();
  process.brickWalletCli = {
    // 进程名称
    name: processName,

    // 上下文
    ctx: {
      config,
      proxyConfig,
      logger: getLogger(processName),
      spotClient: getSpotClient(proxyConfig),
    },

    // 变量
    variables: {},
  };

  // 1. 捕获同步/回调异步中的未捕获错误
  process.on('uncaughtException', (error) => {
    let msg = '未捕获的同步/回调异步错误：\n';
    msg += `错误信息：${error.message}\n`;
    msg += `错误堆栈：${error.stack}\n`;
    msg += `错误码：${error.code}\n`; // 错误标识（如 ETIMEDOUT、ECONNREFUSED）
    
    process.brickWalletCli.ctx.logger.error(msg);
  });

  // 2. 捕获 Promise 未处理的拒绝（最容易遗漏的场景）
  process.on('unhandledRejection', (reason, promise) => {
    let msg = '未处理的 Promise 拒绝：\n';

    const errReason = reason instanceof Error ? reason.message : reason;
    msg += `拒绝原因：${errReason}\n`;
    msg += `关联的 Promise：${promise}\n`;
    msg += `错误堆栈：${reason instanceof Error ? reason.stack : '无'}\n`;

    process.brickWalletCli.ctx.logger.error(msg);
  });

  logger.info('初始化进程数据完成');
}

module.exports = initProcess;
