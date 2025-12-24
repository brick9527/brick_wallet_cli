const { logger, spotClient } = process.brickWalletCli.ctx;


async function getCurrentPrice(symbolList, options = {}) {
  let condition = {
    symbols: symbolList,
  };

  if (Object.keys(options)) {
    condition = {
      ...condition,
      ...options,
    };
  }

  logger.debug('condition = ', JSON.stringify(condition));

  const response = await spotClient.restAPI.tickerPrice(condition);

  const rateLimits = response.rateLimits;
  logger.debug('allOrderList() rate limits:', rateLimits);

  const rawContent = await response.data();

  logger.debug('data = ', JSON.stringify(rawContent));

  return rawContent;
}

module.exports = getCurrentPrice;