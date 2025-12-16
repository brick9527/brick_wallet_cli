#!/usr/bin/env node

require('dotenv').config({ debug: false });
require('../src/libs/init_process')(process, 'getallorder');

const _ = require('lodash');

const getAllOrder = require('../src/controller/get_order/get_all_order');
const generateTradeListTable = require('../src/libs/table/trade_list');
const getSymbolInfo = require('../src/libs/get_symbol_info');
const MergeCounter = require('../src/model/merge_counter');

const logger = process.brickWalletCli.ctx.logger;

async function runGetAllOrder(config) {
  if (config) {
    process.brickWalletCli.ctx.config = config;
  }

  const mySpotSymbolList = process.brickWalletCli.ctx.config?.symbolList || [];
  // const mySpotSymbolList = ['TRUMPUSDT'];

  const recordList = [];
  for (const symbolItem of mySpotSymbolList) {
    const options = {};
    if (_.get(process, `brickWalletCli.ctx.config.trade.${symbolItem}.fromId`)) {
      options.fromId = _.get(process, `brickWalletCli.ctx.config.trade.${symbolItem}.fromId`);
    }

    const symbolInfo = getSymbolInfo(symbolItem);
    if (!symbolInfo.status) {
      logger.error(symbolInfo.errMsg);
      continue;
    }

    let calculateInfo;
    try {
      calculateInfo = await getAllOrder( symbolItem, options);

      recordList.push({
        symbol: symbolItem,
        symbolInfo: symbolInfo,
        avgPrice: calculateInfo.avgPrice,
        totalValue: calculateInfo.buyerCount.totalValue,
        totalNum: (Number(calculateInfo.buyerCount.totalNum) - Number(calculateInfo.sellerCount.totalNum)).toFixed(8),
      });

    } catch (err) {
      logger.error(`获取 ${symbolItem} 相关订单失败。${err.message}`);
      logger.error(`错误堆栈：${err.stack}`);

      recordList.push({
        symbol: symbolItem,
        symbolInfo: symbolInfo,
        avgPrice: 'NaN',
        totalValue: 'NaN',
        totalNum: 'NaN',
      });
    }
  }

  logger.debug(`recordList = ${JSON.stringify(recordList)}`);

  // 合并recordList中的数据
  const mergeObj = {};
  for (const recordItem of recordList) {
    if (!Object.keys(mergeObj).includes(recordItem.symbolInfo.baseCurrency)) {
      mergeObj[recordItem.symbolInfo.baseCurrency] = new MergeCounter({
        symbolInfo: recordItem.symbolInfo,
        mergeQuoteCurrency: process.brickWalletCli.ctx.config?.merge_quote_currency || [],
      });
    }

    mergeObj[recordItem.symbolInfo.baseCurrency].add({
      symbol: recordItem.symbol,
      avgPrice: recordItem.avgPrice,
      totalValue: recordItem.totalValue,
      totalNum: recordItem.totalNum,
    });
  }

  // 合并mergeObj中的数据
  const mergeDataList = [];
  for (const baseCurrency of Object.keys(mergeObj)) {
    mergeDataList.push(mergeObj[baseCurrency].getResult().getJSON());
  }

  logger.debug(`mergeDataList = ${JSON.stringify(mergeDataList)}`);

  generateTradeListTable(mergeDataList);
}

if (require.main === module) {
  runGetAllOrder();
}

module.exports = runGetAllOrder;
