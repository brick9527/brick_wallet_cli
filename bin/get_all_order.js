#!/usr/bin/env node

require('dotenv').config({ debug: false });
require('../src/libs/init_process')(process, 'getallorder');

const _ = require('lodash');

const getAllOrder = require('../src/controller/get_order/get_all_order');
const generateTradeListTable = require('../src/libs/table/trade_list');

async function runGetAllOrder(config) {
  if (config) {
    process.brickWalletCli.ctx.config = config;
  }

  const mySpotSymbolList = process.brickWalletCli.ctx.config?.symbolList || [];
  // const mySpotSymbolList = ['TRUMPUSDT'];

  const tradeList = [];
  for (const symbolItem of mySpotSymbolList) {
    const options = {};
    if (_.get(process, `brickWalletCli.ctx.config.trade.${symbolItem}.fromId`)) {
      options.fromId = _.get(process, `brickWalletCli.ctx.config.trade.${symbolItem}.fromId`);
    }

    let calculateInfo;
    try {
      calculateInfo = await getAllOrder( symbolItem, options);

      tradeList.push({
        symbol: symbolItem,
        avgPrice: calculateInfo.avgPrice,
        totalValue: calculateInfo.counter.buyer.totalValue,
        totalNum: (Number(calculateInfo.counter.buyer.totalNum) - Number(calculateInfo.counter.seller.totalNum)).toFixed(8),
      });
    } catch (err) {
      process.brickWalletCli.ctx.logger.error(`获取 ${symbolItem} 相关订单失败。${err.message}`);
      process.brickWalletCli.ctx.logger.error(`错误堆栈：${err.stack}`);

      tradeList.push({
        symbol: symbolItem,
        avgPrice: 'NaN',
        totalValue: 'NaN',
        totalNum: 'NaN',
      });
    }
  }

  process.brickWalletCli.ctx.logger.debug(`tradeList = ${JSON.stringify(tradeList)}`);

  generateTradeListTable(tradeList);
}

if (require.main === module) {
  runGetAllOrder();
}

module.exports = runGetAllOrder;
