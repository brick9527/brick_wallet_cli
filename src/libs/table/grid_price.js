const Table = require('cli-table3');


/**
 * gridPriceList = [
 *   symbol: 'BTCUSDT',
 *   range: 30,
 *   avgPrice: 89372.883000,
 *   gridPrice: {
 *     off: {
 *       _5_off: '84904.23980000',
 *       _10_off: '80435.59560000',
 *       _15_off: '75966.95140000',
 *       _20_off: '71498.30720000',
 *       _25_off: '67029.66300000',
 *       _30_off: '62561.01880000'
 *     },
 *     up: {
 *       _5_up: '93841.52820000',
 *       _10_up: '98310.17240000',
 *       _15_up: '102778.81660000',
 *       _20_up: '107247.46080000',
 *       _25_up: '111716.10500000',
 *       _30_up: '116184.74920000'
 *     }
 *   }
 * ]
 */

function generateGridPriceTable(gridPriceList = {}) {
  if (gridPriceList.length === 0) {
    return ;
  }

  const table = new Table({
      head: ['#', 'Symbol', 'range', 'avePrice', 'off grid', 'up grid'],
    });

  for (let i = 0; i < gridPriceList.length; i++) {
    const gridPriceItem = gridPriceList[i];
    if (!gridPriceItem.gridPrice) {
      table.push([
        i+1,
        gridPriceItem.symbol,
        gridPriceItem.range,
        gridPriceItem.avgPrice,
      ]);
      continue;
    }

    const offContent = `5% : ${gridPriceItem.gridPrice.off._5_off}\n` +
                        `10% : ${gridPriceItem.gridPrice.off._10_off}\n` +
                        `15% : ${gridPriceItem.gridPrice.off._15_off}\n` +
                        `20% : ${gridPriceItem.gridPrice.off._20_off}\n` +
                        `25% : ${gridPriceItem.gridPrice.off._25_off}\n` +
                        `30% : ${gridPriceItem.gridPrice.off._30_off}`;
    const upContent = `5% : ${gridPriceItem.gridPrice.up._5_up}\n` +
                       `10% : ${gridPriceItem.gridPrice.up._10_up}\n` +
                       `15% : ${gridPriceItem.gridPrice.up._15_up}\n` +
                       `20% : ${gridPriceItem.gridPrice.up._20_up}\n` +
                       `25% : ${gridPriceItem.gridPrice.up._25_up}\n` +
                       `30% : ${gridPriceItem.gridPrice.up._30_up}`;

    table.push([
      i+1,
      gridPriceItem.symbol,
      gridPriceItem.range,
      gridPriceItem.avgPrice,
      offContent,
      upContent,
    ]);
  }

  console.log(table.toString());
  return table;
}

module.exports = generateGridPriceTable;