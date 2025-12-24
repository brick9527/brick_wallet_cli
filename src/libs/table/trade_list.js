const Table = require('cli-table3');

function generateTradeListTable(mergeDataList = []) {
  if (mergeDataList.length === 0) {
    return ;
  }

  const table = new Table({
    head: ['#', 'Symbol', 'avgPrice', 'amount', 'totalValue', 'price', 'P/L rate'],
  });

  for (let i = 0; i < mergeDataList.length; i++) {
    const mergeDataItem = mergeDataList[i];
    let avgPriceContent = `${mergeDataItem.avgPrice}\n`;
    let totalNumContent = `${mergeDataItem.totalNum}\n`;
    let totalValueContent = `${mergeDataItem.totalValue}\n`;
    
    for (const key in mergeDataItem.mergeInfo) {
      avgPriceContent += `${key}: ${mergeDataItem.mergeInfo[key].avgPrice} (${mergeDataItem.mergeInfo[key].rate}%)\n`;
      totalNumContent += `${key}: ${mergeDataItem.mergeInfo[key].totalNum} (${mergeDataItem.mergeInfo[key].rate}%)\n`;
      totalValueContent += `${key}: ${mergeDataItem.mergeInfo[key].totalValue} (${mergeDataItem.mergeInfo[key].rate}%)\n`;
    }
    table.push([
      i+1,
      mergeDataItem.symbolInfo.baseCurrency,
      avgPriceContent,
      totalNumContent,
      totalValueContent,
      mergeDataItem.currentPrice,
      `${mergeDataItem.profitLossRate}%`,
    ]);
  }

  console.log(table.toString());
  return table;
}

module.exports = generateTradeListTable;