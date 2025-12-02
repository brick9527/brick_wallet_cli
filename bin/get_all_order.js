require('dotenv').config();
require('../src/libs/init_process')(process, 'getallorder');

const _ = require('lodash');

const getAllOrder = require('../src/controller/get_order/get_all_order');
const generateTradeListTable = require('../src/libs/table/trade_list');

async function main() {
  const mySpotSymbolList = process.brickWalletCli.ctx.config?.symbolList || [];

  const tradeList = [];
  for (const symbolItem of mySpotSymbolList) {
    const options = {};
    if (_.get(process, `brickWalletCli.ctx.config.trade.${symbolItem}.fromId`)) {
      options.fromId = _.get(process, `brickWalletCli.ctx.config.trade.${symbolItem}.fromId`);
    }

    const calculateInfo = await getAllOrder( symbolItem, options);

    tradeList.push({
      symbol: symbolItem,
      avgPrice: calculateInfo.avgPrice,
      totalValue: calculateInfo.totalValue,
      totalNum: calculateInfo.totalNum,
    });
  }

  generateTradeListTable(tradeList)
}

main();
