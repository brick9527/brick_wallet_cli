const dayjs = require('dayjs');

const { logger, spotClient } = process.brickWalletCli.ctx;

async function getTime() {
  const localTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const response = await spotClient.restAPI.time();
  // logger.info(response.rateLimits);

  const data = await response.data();
  logger.info('服务器时间：' + dayjs(data.serverTime).format('YYYY-MM-DD HH:mm:ss'));
  logger.info('本地时间：' + localTime);
}

module.exports = getTime;