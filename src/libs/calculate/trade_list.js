const _ = require('lodash');

/**
 * 设置存储点
 */
function _setSavePoint(result) {
  result.savePoint.totalNum = result.totalNum.toFixed(8);
  result.savePoint.totalValue = result.totalValue.toFixed(8);
  result.savePoint.avgPrice = (Number(result.totalValue) / Number(result.totalNum)).toFixed(8);
}

function calculateTradeList(tradeList, symbolInfo, initData = {}) {
  if (tradeList.length === 0) {
    throw new Error(`tradeList 不能为空`);
  }

  process.brickWalletCli.ctx.logger.debug('initData = ', JSON.stringify(initData));

  const result = {
    // avgPrice = totalValue / totalNum
    avgPrice: 0,

    // 所有交易的价值之和（单位：USDT）
    totalValue: initData?.totalValue || 0,

    // 数量之和
    totalNum: initData?.totalNum || 0,

    // 手续费之和（单位：USDT）
    commissionInfo: {
      total: 0,
      buyer: {
        total: 0,
        maker: 0,
        notMaker: 0,
      },
      seller: {
        total: 0,
        maker: 0,
        notMaker: 0,
      },
    },
    firstIInfo: _.first(tradeList),
    lastInfo: _.last(tradeList),
    
    // 存储点位(在倒数第二个数据节点存储 avgPrice, totalValue, totalNum)
    savePoint: {
      id: _.last(tradeList)?.id,
      avgPrice: 0,
      totalValue: 0,
      totalNum: 0,
    },
  };

  /**
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
  for (let i = 0; i < tradeList.length; i++) {
    const tradeItem = tradeList[i]
    // 买入
    if (tradeItem.isBuyer) {
      if (tradeItem.commissionAsset === symbolInfo.quoteCurrency) {
        // 手续费结算资产类型为计价货币
        result.totalNum = Number(result.totalNum) + Number(tradeItem.qty);
        result.totalValue = Number(result.totalValue) + Number(tradeItem.quoteQty) - Number(tradeItem.commission);
        result.commissionInfo.total += Number(tradeItem.commission);
        result.commissionInfo.buyer.total += Number(tradeItem.commission);
        if (tradeItem.isMaker) {
          result.commissionInfo.buyer.maker += Number(tradeItem.commission);
        } else {
          result.commissionInfo.buyer.notMaker += Number(tradeItem.commission);
        }

        // 设置存储点
        if (i === tradeList.length - 2) {
          _setSavePoint(result);
        }

        continue;
      }

      // 手续费结算资产类型为基础货币
      result.totalNum = Number(result.totalNum) + Number(tradeItem.qty) - Number(tradeItem.commission);
      result.totalValue = Number(result.totalValue) + Number(tradeItem.quoteQty);
      const quoteCurrrencyCommission = Number(tradeItem.price) * Number(tradeItem.commission);
      result.commissionInfo.total += quoteCurrrencyCommission;
      result.commissionInfo.buyer.total += quoteCurrrencyCommission;
      if (tradeItem.isMaker) {
        result.commissionInfo.buyer.maker += quoteCurrrencyCommission;
      } else {
        result.commissionInfo.buyer.notMaker += quoteCurrrencyCommission;
      }

      // 设置存储点
      if (i === tradeList.length - 2) {
        _setSavePoint(result);
      }

      continue;
    }

    // 卖出
    if (tradeItem.commissionAsset === symbolInfo.quoteCurrency) {
      // 手续费结算资产类型为计价货币
      result.totalNum = Number(result.totalNum) - Number(tradeItem.qty);
      result.totalValue = Number(result.totalValue) - Number(tradeItem.quoteQty) - Number(tradeItem.commission);

      result.commissionInfo.total += Number(tradeItem.commission);
      result.commissionInfo.seller.total += Number(tradeItem.commission);
      if (tradeItem.isMaker) {
        result.commissionInfo.seller.maker += Number(tradeItem.commission);
      } else {
        result.commissionInfo.seller.notMaker += Number(tradeItem.commission);
      }

      // 设置存储点
      if (i === tradeList.length - 2) {
        _setSavePoint(result);
      }

      continue;
    }
    
    // 手续费结算资产类型为基础货币
    result.totalNum = Number(result.totalNum) - Number(tradeItem.qty) - Number(tradeItem.commission);
    result.totalValue = Number(result.totalValue) - Number(tradeItem.quoteQty);

    const quoteCurrrencyCommission = Number(tradeItem.price) * Number(tradeItem.commission);
    result.commissionInfo.total += quoteCurrrencyCommission;
    result.commissionInfo.seller.total += quoteCurrrencyCommission;
    if (tradeItem.isMaker) {
      result.commissionInfo.seller.maker += quoteCurrrencyCommission;
    } else {
      result.commissionInfo.seller.notMaker += quoteCurrrencyCommission;
    }

    // 设置存储点
    if (i === tradeList.length - 2) {
      _setSavePoint(result);
    }
  }

  // 计算平均价
  result.avgPrice = Number(result.totalValue) / Number(result.totalNum);

  return {
    avgPrice: result.avgPrice.toFixed(8),
    totalValue: result.totalValue.toFixed(8),
    totalNum: result.totalNum.toFixed(8),
    commissionInfo: {
      total: result.commissionInfo.total.toFixed(8),
      buyer: {
        total: result.commissionInfo.buyer.total.toFixed(8),
        maker: result.commissionInfo.buyer.maker.toFixed(8),
        notMaker: result.commissionInfo.buyer.notMaker.toFixed(8),
      },
      seller: {
        total: result.commissionInfo.seller.total.toFixed(8),
        maker: result.commissionInfo.seller.maker.toFixed(8),
        notMaker: result.commissionInfo.seller.notMaker.toFixed(8),
      },
    },
    firstIInfo: result.firstIInfo,
    lastInfo: result.lastInfo,
  };
}

module.exports = calculateTradeList;
