const _ = require('lodash');

const Counter = require('../../model/counter');

/**
 * 计算交易列表的统计信息
 * 
 * 该函数用于处理交易列表数据，计算买入/卖出的总数量、总价值、平均价格以及手续费等统计信息。
 * 支持处理不同手续费结算资产类型（基础货币或计价货币）的交易，并在倒数第二个交易处设置存储点。
 * 
 * @param {Array<Object>} tradeList - 交易记录列表
 * @param {Object} symbolInfo - 交易对信息对象
 * @param {string} symbolInfo.symbol - 交易对符号
 * @param {string} symbolInfo.baseCurrency - 基础货币
 * @param {string} symbolInfo.quoteCurrency - 计价货币
 * @param {Object} [initData={}] - 初始化数据对象
 * @param {Object} [initData.buyerCount] - 初始买家统计数据
 * @param {Object} [initData.sellerCount] - 初始卖家统计数据
 * @param {Object} [initData.commissionCount] - 初始手续费统计数据
 * 
 * @returns {Object} - 计算结果对象
 * @returns {Object} return.avgPrice - 平均价格信息
 * @returns {Object} return.buyerCount - 买家统计数据
 * @returns {Object} return.sellerCount - 卖家统计数据
 * @returns {Object} return.commissionCount - 手续费统计数据
 * @returns {Object} return.savePoint - 存储点信息（倒数第二个交易处的统计数据）
 * @returns {Object} return.firstIInfo - 第一条交易记录
 * @returns {Object} return.lastInfo - 最后一条交易记录
 * 
 * @throws {Error} - 如果tradeList为空，则抛出错误
 * 
 * @example
 * -- 计算BTCUSDT交易列表的统计信息
 * const result = calculateTradeList(tradeList, {
 *   symbol: 'BTCUSDT',
 *   baseCurrency: 'BTC',
 *   quoteCurrency: 'USDT'
 * });
 * console.log('平均价格:', result.avgPrice);
 * console.log('总买入数量:', result.buyerCount.totalNum);
 * console.log('总手续费:', result.commissionCount.totalNum);
 */
function calculateTradeList(tradeList, symbolInfo, initData = {}) {
  // 验证交易列表不能为空
  if (tradeList.length === 0) {
    throw new Error('tradeList 不能为空');
  }

  // 记录初始化数据
  process.brickWalletCli.ctx.logger.debug('initData = ', JSON.stringify(initData));

  // 创建交易计数器实例
  const counter = new Counter({
    buyerCount: initData.buyerCount || {},  // 初始买家统计数据
    sellerCount: initData.sellerCount || {},  // 初始卖家统计数据
    commissionCount: initData.commissionCount || {},  // 初始手续费统计数据
  });

  // 初始化计算结果对象
  const result = {
    firstIInfo: _.first(tradeList),  // 第一条交易记录
    lastInfo: _.last(tradeList),  // 最后一条交易记录
    
    // 存储点信息（在倒数第二个交易处存储统计数据）
    savePoint: {
      id: _.last(tradeList)?.id,  // 使用最后一条交易的ID
    },
  };

  /**
   * 交易记录数据结构示例：
   * {
      "symbol": "BTCUSDT",
      "id": 5535327143,
      "orderId": 52479304656,
      "orderListId": -1,
      "price": "87382.12000000",
      "qty": "0.00121000",
      "quoteQty": "105.73236520",
      "commission": "0.00000121",
      "commissionAsset": "BTC",
      "time": 1763686224629,
      "isBuyer": true,
      "isMaker": false,
      "isBestMatch": true
     }
   */
  
  // 遍历所有交易记录
  for (let i = 0; i < tradeList.length; i++) {
    const tradeItem = tradeList[i];
    
    // #region 买入交易处理
    if (tradeItem.isBuyer) {
      if (tradeItem.commissionAsset === symbolInfo.quoteCurrency) {
        // 手续费结算资产类型为计价货币
        counter.addBuyerTotalNum(tradeItem.qty);  // 添加买入数量
        // 添加买入价值（扣除计价货币手续费）
        counter.addBuyerTotalValue(Number(tradeItem.quoteQty) - Number(tradeItem.commission));

        // 添加手续费统计
        counter.addCommissionTotalNum(tradeItem.commission);
        counter.addCommissionBuyerTotalNum(tradeItem.commission, tradeItem.isMaker ? 'maker' : 'notMaker');

        // 设置存储点（在倒数第二个交易处）
        if (i === tradeList.length - 2) {
          counter.calculateAvgPrice();  // 计算平均价格
          result.savePoint = {
            id: result.savePoint.id,
            ..._.omit(counter.getJSON(), ['id']),  // 合并计数器数据（排除id）
          };
        }

        continue;  // 处理下一条交易
      }

      // 手续费结算资产类型为基础货币
      // 添加买入数量（扣除基础货币手续费）
      counter.addBuyerTotalNum(Number(tradeItem.qty) - Number(tradeItem.commission));      
      counter.addBuyerTotalValue(Number(tradeItem.quoteQty));  // 添加买入价值

      // 将基础货币手续费转换为计价货币
      const quoteCurrrencyCommission = Number(tradeItem.price) * Number(tradeItem.commission);
      // 添加手续费统计
      counter.addCommissionTotalNum(quoteCurrrencyCommission);
      counter.addCommissionBuyerTotalNum(quoteCurrrencyCommission, tradeItem.isMaker ? 'maker' : 'notMaker');

      // 设置存储点（在倒数第二个交易处）
      if (i === tradeList.length - 2) {
        counter.calculateAvgPrice();  // 计算平均价格
        result.savePoint = {
          id: result.savePoint.id,
          ..._.omit(counter.getJSON(), ['id']),  // 合并计数器数据（排除id）
        };
      }

      continue;  // 处理下一条交易
    }
    // #endregion

    // #region 卖出交易处理(只计算totalNum，不计算totalValue)
    if (tradeItem.commissionAsset === symbolInfo.quoteCurrency) {
      // 手续费结算资产类型为计价货币
      counter.addSellerTotalNum(tradeItem.qty);  // 添加卖出数量
      // 添加卖出价值（扣除计价货币手续费）
      counter.addSellerTotalValue(Number(tradeItem.quoteQty) - Number(tradeItem.commission));

      // 添加手续费统计
      counter.addCommissionTotalNum(Number(tradeItem.commission));
      counter.addCommissionSellerTotalNum(Number(tradeItem.commission), tradeItem.isMaker ? 'maker' : 'notMaker');

      // 设置存储点（在倒数第二个交易处）
      if (i === tradeList.length - 2) {
        counter.calculateAvgPrice();  // 计算平均价格
        result.savePoint = {
          id: result.savePoint.id,
          ..._.omit(counter.getJSON(), ['id']),  // 合并计数器数据（排除id）
        };
      }

      continue;  // 处理下一条交易
    }
    
    // 手续费结算资产类型为基础货币
    // 添加卖出数量（扣除基础货币手续费）
    counter.addSellerTotalNum(Number(tradeItem.qty) - Number(tradeItem.commission));
    counter.addSellerTotalValue(Number(tradeItem.quoteQty));  // 添加卖出价值
    
    // 将基础货币手续费转换为计价货币
    const quoteCurrrencyCommission = Number(tradeItem.price) * Number(tradeItem.commission);
    // 添加手续费统计
    counter.addCommissionTotalNum(quoteCurrrencyCommission);
    counter.addCommissionSellerTotalNum(quoteCurrrencyCommission, tradeItem.isMaker ? 'maker' : 'notMaker');

    // 设置存储点（在倒数第二个交易处）
    if (i === tradeList.length - 2) {
      counter.calculateAvgPrice();  // 计算平均价格
      result.savePoint = {
        id: result.savePoint.id,
        ..._.omit(counter.getJSON(), ['id']),  // 合并计数器数据（排除id）
      };
    }
    // #endregion
  }

  // 计算最终的平均价格
  counter.calculateAvgPrice();

  // 返回计算结果
  return {
    ...counter.getJSON(),  // 合并计数器的统计数据
    savePoint: result.savePoint,  // 存储点信息
    firstIInfo: result.firstIInfo,  // 第一条交易记录
    lastInfo: result.lastInfo,  // 最后一条交易记录
  };
}

module.exports = calculateTradeList;