const dayjs = require('dayjs');

const { logger, spotClient } = process.brickWalletCli.ctx;

async function getAccount() {
  const response = await spotClient.restAPI.myTrades({
    symbol: 'SOLUSDT',
    // orderId: 50304181404
    // fromId: 5350162147
  });
  // logger.info(response.rateLimits);

  const rateLimits = response.rateLimits;
  console.log('allOrderList() rate limits:', rateLimits);
  const tradeList = await response.data();

  const myList = tradeList.map(item => {
    return {
      ...item,
      timeLocal: dayjs(item.time).format('YYYY-MM-DD HH:mm:ss'),
    };
  })

  logger.info(myList);
}

module.exports = getAccount;
