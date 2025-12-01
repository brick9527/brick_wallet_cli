const _ = require('lodash');

function calculateTradeList(tradeList, symbolInfo) {
  if (tradeList.length === 0) {
    throw new Error(`tradeList 不能为空`);
  }

  const result = {
    // avgPrice = totalValue / totalNum
    avgPrice: 0,

    // 所有交易的价值之和（单位：USDT）
    totalValue: 0,

    // 数量之和
    totalNum: 0,

    // 手续费之和（单位：USDT）
    commissionInfo: {
      total: 0,
      buyer: {
        total: 0,
        maker: 0,
        notMaker: 0,
      },
      notBuyer: {
        total: 0,
        maker: 0,
        notMaker: 0,
      },
    },
    firstIInfo: _.first(tradeList),
    lastInfo: _.last(tradeList),
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
  for (const tradeItem of tradeList) {
    // 买入
    if (tradeItem.isBuyer) {
      if (tradeItem.commissionAsset === symbolInfo.quoteCurrency) {
        // 手续费结算资产类型为计价货币
        result.totalNum = result.totalNum + Number(tradeItem.qty);
        result.totalValue = result.totalValue + Number(tradeItem.quoteQty) - Number(tradeItem.commission);
        result.commissionInfo.total += Number(tradeItem.commission);
        result.commissionInfo.buyer.total += Number(tradeItem.commission);
        if (tradeItem.isMaker) {
          result.commissionInfo.buyer.maker += Number(tradeItem.commission);
        } else {
          result.commissionInfo.buyer.notMaker += Number(tradeItem.commission);
        }

        continue;
      }

      // 手续费结算资产类型为基础货币
      result.totalNum = result.totalNum + Number(tradeItem.qty) - Number(tradeItem.commission);
      result.totalValue = result.totalValue + Number(tradeItem.quoteQty);
      const quoteCurrrencyCommission = Number(tradeItem.price) * Number(tradeItem.commission);
      result.commissionInfo.total += quoteCurrrencyCommission;
      result.commissionInfo.buyer.total += quoteCurrrencyCommission;
      if (tradeItem.isMaker) {
        result.commissionInfo.buyer.maker += quoteCurrrencyCommission;
      } else {
        result.commissionInfo.buyer.notMaker += quoteCurrrencyCommission;
      }

      continue;
    }

    // 卖出
    if (tradeItem.commissionAsset === symbolInfo.quoteCurrency) {
      // 手续费结算资产类型为计价货币
      result.totalNum = result.totalNum - Number(tradeItem.qty);
      result.totalValue = result.totalValue - Number(tradeItem.quoteQty) - Number(tradeItem.commission);

      result.commissionInfo.total += Number(tradeItem.commission);
      result.commissionInfo.notBuyer.total += Number(tradeItem.commission);
      if (tradeItem.isMaker) {
        result.commissionInfo.notBuyer.maker += Number(tradeItem.commission);
      } else {
        result.commissionInfo.notBuyer.notMaker += Number(tradeItem.commission);
      }

      continue;
    }
    
    // 手续费结算资产类型为基础货币
    result.totalNum = result.totalNum - Number(tradeItem.qty) - Number(tradeItem.commission);
    result.totalValue = result.totalValue - Number(tradeItem.quoteQty);

    const quoteCurrrencyCommission = Number(tradeItem.price) * Number(tradeItem.commission);
    result.commissionInfo.total += quoteCurrrencyCommission;
    result.commissionInfo.notBuyer.total += quoteCurrrencyCommission;
    if (tradeItem.isMaker) {
      result.commissionInfo.notBuyer.maker += quoteCurrrencyCommission;
    } else {
      result.commissionInfo.notBuyer.notMaker += quoteCurrrencyCommission;
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
      notBuyer: {
        total: result.commissionInfo.notBuyer.total.toFixed(8),
        maker: result.commissionInfo.notBuyer.maker.toFixed(8),
        notMaker: result.commissionInfo.notBuyer.notMaker.toFixed(8),
      },
    },
    firstIInfo: result.firstIInfo,
    lastInfo: result.lastInfo,
  };
}

module.exports = calculateTradeList;
