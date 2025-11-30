const logger = require('../../util/log4js').getLogger('getaccount');

async function getAccount() {
  const response = await process.brickWalletCli.ctx.spotClient.restAPI.getAccount();
  // logger.info(response.rateLimits);

  logger.info(await response.data());
}

module.exports = getAccount;