const { logger, spotClient } = process.brickWalletCli.ctx;

async function getAccount() {
  const response = await spotClient.restAPI.getAccount({
    omitZeroBalances: true,
  });
  // logger.info(response.rateLimits);

  logger.info(await response.data());
}

module.exports = getAccount;