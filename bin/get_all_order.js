require('dotenv').config();
require('../src/libs/init_process')(process, 'getallorder');

const _ = require('lodash');

const getAllOrder = require('../src/controller/get_order/get_all_order');

function main() {
  const mySymbolList = ['BTCUSDT', 'SOLUSDT'];
  for (const symbolItem of mySymbolList) {
    const options = {};
    if (_.get(process, `brickWalletCli.ctx.config.trade.${symbolItem}.fromId`)) {
      options.fromId = _.get(process, `brickWalletCli.ctx.config.trade.${symbolItem}.fromId`);
    }

    getAllOrder( symbolItem, options);
  }
}

main();
