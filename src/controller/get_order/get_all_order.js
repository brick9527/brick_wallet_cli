const _ = require('lodash');

const { logger, spotClient } = process.brickWalletCli.ctx;
const formatMyTradeRes = require('../../libs/format_my_trade_response');
const calculateTradeList = require('../../libs/calculate/trade_list');
const getSymbolInfo = require('../../libs/get_symbol_info');

/**
 * 获取账户全部交易记录并计算交易对的成本价
 * 
 * 该函数通过 Binance API 获取指定交易对的全部交易记录，然后对这些记录进行格式化、
 * 解析和计算，最终返回该交易对的平均价格、总数量和总价值等统计信息。
 * 
 * @param {string} symbol - 要查询的交易对符号（如 BTCUSDT）
 * @param {Object} [options={}] - API 请求的可选参数
 * @param {number} [options.fromId] - 从哪个交易 ID 开始查询，用于增量查询
 * 
 * @returns {Promise<Object|null>} - 返回包含交易统计信息的对象，失败时返回 null
 * @returns {Object} return.avgPrice - 该交易对的平均价格
 * @returns {Object} return.counter - 交易统计计数器对象
 * @returns {number} return.counter.buyer.totalValue - 买入的总价值
 * @returns {number} return.counter.buyer.totalNum - 买入的总数量
 * @returns {number} return.counter.seller.totalValue - 卖出的总价值
 * @returns {number} return.counter.seller.totalNum - 卖出的总数量
 * 
 * @example
 * -- 获取 BTCUSDT 的所有交易记录并计算成本价
 * const result = await getAccountAllOrder('BTCUSDT');
 * console.log('平均价格:', result.avgPrice);
 * console.log('总持有数量:', result.counter.buyer.totalNum - result.counter.seller.totalNum);
 * 
 * -- 使用 fromId 进行增量查询
 * const result = await getAccountAllOrder('BTCUSDT', { fromId: 123456789 });
 */
async function getAccountAllOrder(symbol, options = {}) {
  // 构建 API 请求条件
  let condition = {
    symbol,  // 交易对符号
  };

  // 如果有额外参数，合并到请求条件中
  if (Object.keys(options)) {
    condition = {
      ...condition,
      ...options,
    };
  }

  // 记录请求条件
  logger.debug('condition = ', JSON.stringify(condition));

  // 调用 Binance API 获取交易记录
  const response = await spotClient.restAPI.myTrades(condition);

  // 获取 API 调用的速率限制信息
  const rateLimits = response.rateLimits;
  logger.debug('allOrderList() rate limits:', rateLimits);

  // 获取 API 响应的原始数据
  const rawContent = await response.data();

  // 记录原始交易数据
  logger.debug('data = ', JSON.stringify(rawContent));

  // 格式化交易记录数据
  const tradeList = formatMyTradeRes(rawContent);
  
  // 获取交易对的详细信息
  const symbolInfo = getSymbolInfo(symbol);
  if (!symbolInfo.status) {
    logger.error(symbolInfo.errMsg);
    return null;  // 交易对信息获取失败，返回 null
  }

  // 从配置中获取该交易对的初始数据
  const initData = _.get(process, `brickWalletCli.ctx.config.trade.${symbol}`, {});
  
  // 计算交易统计信息
  const calculateResult = calculateTradeList(tradeList, symbolInfo, initData);

  // 记录计算结果
  logger.debug(`${symbol} calculate result = ${JSON.stringify(calculateResult)}`);

  // 返回计算结果
  return calculateResult;
}

module.exports = getAccountAllOrder;