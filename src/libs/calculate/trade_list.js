const _ = require('lodash');

const Counter = require('../../model/counter');

function calculateTradeList(tradeList, symbolInfo, initData = {}) {
  if (tradeList.length === 0) {
    throw new Error('tradeList 不能为空');
  }

  process.brickWalletCli.ctx.logger.debug('initData = ', JSON.stringify(initData));

  const counter = new Counter({
    buyerCount: initData.buyerCount || {},
    sellerCount: initData.sellerCount || {},
    commissionCount: initData.commissionCount || {},
  });

  const result = {
    firstIInfo: _.first(tradeList),
    lastInfo: _.last(tradeList),
    
    // 存储点位(在倒数第二个数据节点存储 avgPrice, totalValue, totalNum)
    savePoint: {
      id: _.last(tradeList)?.id,
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
    // #region 买入
    if (tradeItem.isBuyer) {
      if (tradeItem.commissionAsset === symbolInfo.quoteCurrency) {
        // 手续费结算资产类型为计价货币
        counter.addBuyerTotalNum(tradeItem.qty);
        counter.addBuyerTotalValue(Number(tradeItem.quoteQty) - Number(tradeItem.commission));

        counter.addCommissionTotalNum(tradeItem.commission);
        counter.addCommissionBuyerTotalNum(tradeItem.commission, tradeItem.isMaker ? 'maker' : 'notMaker');

        // 设置存储点
        if (i === tradeList.length - 2) {
          counter.calculateAvgPrice();
          result.savePoint = {
            id: result.savePoint.id,
            ..._.omit(counter.getJSON(), ['id']),
          };
        }

        continue;
      }

      // 手续费结算资产类型为基础货币
      counter.addBuyerTotalNum(Number(tradeItem.qty) - Number(tradeItem.commission));      
      counter.addBuyerTotalValue(Number(tradeItem.quoteQty));

      const quoteCurrrencyCommission = Number(tradeItem.price) * Number(tradeItem.commission);
      counter.addCommissionTotalNum(quoteCurrrencyCommission);
      counter.addCommissionBuyerTotalNum(quoteCurrrencyCommission, tradeItem.isMaker ? 'maker' : 'notMaker');

      // 设置存储点
      if (i === tradeList.length - 2) {
        counter.calculateAvgPrice();
        result.savePoint = {
          id: result.savePoint.id,
          ..._.omit(counter.getJSON(), ['id']),
        };
      }

      continue;
    }
    // #endregion

    // #region 卖出(只计算totalNum，不计算totalValue)
    if (tradeItem.commissionAsset === symbolInfo.quoteCurrency) {
      // 手续费结算资产类型为计价货币
      counter.addSellerTotalNum(tradeItem.qty);
      counter.addSellerTotalValue(Number(tradeItem.quoteQty) - Number(tradeItem.commission));

      counter.addCommissionTotalNum(Number(tradeItem.commission));
      counter.addCommissionSellerTotalNum(Number(tradeItem.commission), tradeItem.isMaker ? 'maker' : 'notMaker');

      // 设置存储点
      if (i === tradeList.length - 2) {
        counter.calculateAvgPrice();
        result.savePoint = {
          id: result.savePoint.id,
          ..._.omit(counter.getJSON(), ['id']),
        };
      }

      continue;
    }
    
    // 手续费结算资产类型为基础货币
    counter.addSellerTotalNum(Number(tradeItem.qty) - Number(tradeItem.commission));
    counter.addSellerTotalValue(Number(tradeItem.quoteQty));
    
    const quoteCurrrencyCommission = Number(tradeItem.price) * Number(tradeItem.commission);
    counter.addCommissionTotalNum(quoteCurrrencyCommission);
    counter.addCommissionSellerTotalNum(quoteCurrrencyCommission, tradeItem.isMaker ? 'maker' : 'notMaker');

    // 设置存储点
    if (i === tradeList.length - 2) {
      counter.calculateAvgPrice();
      result.savePoint = {
        id: result.savePoint.id,
        ..._.omit(counter.getJSON(), ['id']),
      };
    }

    // #endregion
  }

  counter.calculateAvgPrice();

  return {
    ...counter.getJSON(),

    savePoint: result.savePoint,
    firstIInfo: result.firstIInfo,
    lastInfo: result.lastInfo,
  };
}

module.exports = calculateTradeList;
