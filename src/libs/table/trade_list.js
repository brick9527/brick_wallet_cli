const Table = require('cli-table3');

function generateTradeListTable(tradeList = []) {
  if (tradeList.length === 0) {
    return ;
  }

  const table = new Table({
    head: ['#', 'Symbol', 'avgPrice', 'amount', 'totalValue'],
  });

  for (let i = 0; i < tradeList.length; i++) {
    const tradeItem = tradeList[i]
    table.push([i+1, tradeItem.symbol, tradeItem.avgPrice, tradeItem.totalNum, tradeItem.totalValue]);
  }

  console.log(table.toString());
  return table;
}

module.exports = generateTradeListTable;