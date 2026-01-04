const dayjs = require('dayjs');

async function parseData({ data }) {

  const objList = [];
  for (const dataItem of data) {

    const obj = {
      openTime: dayjs(dataItem[0]).format('YYYY-MM-DD HH:mm:ss'),
      open: dataItem[1],
      high: dataItem[2],
      low: dataItem[3],
      close: dataItem[4],
      volume: dataItem[5],
      closeTime: dayjs(dataItem[6]).format('YYYY-MM-DD HH:mm:ss'),
      quoteAssetVolume: dataItem[7],
      trades: dataItem[8],
      takerBuyBaseAssetVolume: dataItem[9],
      takerBuyQuoteAssetVolume: dataItem[10],
    };

    objList.push(obj);
  }

  return objList;
}

module.exports = parseData;