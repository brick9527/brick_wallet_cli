const _ = require('lodash');

const { logger, spotClient } = process.brickWalletCli.ctx;
const formatMyTradeRes = require('../../libs/format_my_trade_response');
const calculateTradeList = require('../../libs/calculate/trade_list');
const getSymbolInfo = require('../../libs/get_symbol_info');

async function getAccountAllOrder(symbol, options = {}) {
  let condition = {
    symbol,
  };

  if (Object.keys(options)) {
    condition = {
      ...condition,
      ...options,
    };
  }

  logger.debug('condition = ', JSON.stringify(condition));

  const response = await spotClient.restAPI.myTrades(condition);

  const rateLimits = response.rateLimits;
  logger.debug('allOrderList() rate limits:', rateLimits);

  const rawContent = await response.data();

  logger.debug('data = ', JSON.stringify(rawContent));

  const tradeList = formatMyTradeRes(rawContent);
  const symbolInfo = getSymbolInfo(symbol);
  if (!symbolInfo.status) {
    logger.error(symbolInfo.errMsg);
    return;
  }

  const initData = _.get(process, `brickWalletCli.ctx.config.trade.${symbol}`, {});
  const calculateResult = calculateTradeList(tradeList, symbolInfo, initData);

  logger.debug(`${symbol} calculate result = ${JSON.stringify(calculateResult)}`);

  // 合并calculateResult中的数据
  // const mergeCounter = new MergeCounter({
  //   symbolInfo,
  //   mergeQuoteCurrency: process.brickWalletCli.ctx.config?.merge_quote_currency || [],
  // });
  // mergeCounter.add({
  //   symbol,
  //   avgPrice: calculateResult.avgPrice,
  //   totalValue: calculateResult.buyerCount.totalValue,
  //   totalNum: calculateResult.buyerCount.totalNum,
  // });

  return calculateResult;
}

module.exports = getAccountAllOrder;
