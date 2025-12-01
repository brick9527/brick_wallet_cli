const QUOTE_CURRENCY = require('../constant/quote_currency');

function getSymbolInfo (symbol) {
  for (const QUOTE_CURRENCY_ITEM of QUOTE_CURRENCY) {
    if (!symbol.endsWith(QUOTE_CURRENCY_ITEM)) {
      continue;
    }

    // 命中匹配
    const baseCurrency = symbol.slice(0, symbol.length - QUOTE_CURRENCY_ITEM.length);
    return {
      status: true,
      symbol,
      baseCurrency,
      quoteCurrency: QUOTE_CURRENCY_ITEM,
    };
  }

  return {
    status: false,
    errMsg: '未知的计价货币',
  };
}

module.exports = getSymbolInfo;