require('dotenv').config({ debug: false });
require('../src/libs/init_process')(process, 'getsma');

const dayjs = require('dayjs');

const getUiklineData = require('../src/controller/get_kline/uikline/get_single_data');
const parseData = require('../src/controller/get_kline/uikline/parse_data');
const getSMA = require('../src/controller/calculate/sma/index');
const generateGridPriceList = require('../src/controller/calculate/grid_price/index');
const generateGridPriceTable = require('../src/libs/table/grid_price');

async function runGetSma({ dayRange = 30, enableGridPrice = true, config } = {}) {
  if (config) {
    process.brickWalletCli.ctx.config = config;
  }
  
  const { logger } = process.brickWalletCli.ctx;
  const currentTime = dayjs();
  const symbolGridPriceList = [];

  for (const symbol of config.symbolList) {
    
    const data = await getUiklineData({
      symbol,
      interval: '1d',
      endTime: currentTime.endOf('day').valueOf(),
      startTime: currentTime.subtract(dayRange, 'day').startOf('day').valueOf(),
    });

    // 解析data
    const dataObj = await parseData({ 
      data,
    });

    const closeDataList = dataObj.map(item => Number(item.close));
    // 计算n日均线
    const avgPrice = await getSMA(closeDataList, dayRange);

    logger.info(`range = ${dayRange}, avgPrice = ${avgPrice}`);

    if (!enableGridPrice) {
      return;
    }

    // 计算网格价位
    // 5% 10% 15% 20% 25% 30%
    const gridPriceObj = generateGridPriceList(Number(avgPrice));
    console.log(gridPriceObj);

    symbolGridPriceList.push({
      symbol,
      range: dayRange,
      avgPrice,
      gridPrice: gridPriceObj,
    });
  }

  // 整理表格内容
  generateGridPriceTable(symbolGridPriceList);
}

if (require.main === module) {
  runGetSma();
}

module.exports = runGetSma;

