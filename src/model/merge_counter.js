class MergeCounter {
  _id = null;

  // 本位币对信息
  _symbolInfo = {
    symbol: '',
    baseCurrency: '',
    quoteCurrency: '',
  };

  // 可以合并的币对列表
  _mergeSymbolList = [];

  // 合并信息
  _mergeCount = {
    avgPrice: 0,
    totalValue: 0,
    totalNum: 0,
    symbolList: [],

    // ...info
    mergeInfo: {},
  };

  // 初始化数据
  constructor({ symbolInfo, mergeQuoteCurrency = [] }) {
    this._symbolInfo = {
      symbol: symbolInfo.symbol,
      baseCurrency: symbolInfo.baseCurrency,
      quoteCurrency: symbolInfo.quoteCurrency,
    };

    this._mergeCount.mergeInfo[this._symbolInfo.symbol] = {
      avgPrice: 0,
      totalValue: 0,
      totalNum: 0,
      rate: 0,
    };

    this._mergeSymbolList = mergeQuoteCurrency.map((item) => {

      this._mergeCount.mergeInfo[`${this._symbolInfo.baseCurrency}${item}`] = {
        avgPrice: 0,
        totalValue: 0,
        totalNum: 0,
        rate: 0,
      };
      return `${this._symbolInfo.baseCurrency}${item}`;
    });
  }

  add({ symbol, avgPrice, totalValue, totalNum }) {
    if (symbol === this._symbolInfo.symbol || this._mergeSymbolList.includes(symbol)) {
      this._mergeCount.mergeInfo[symbol].avgPrice = avgPrice;
      this._mergeCount.mergeInfo[symbol].totalValue = totalValue;
      this._mergeCount.mergeInfo[symbol].totalNum = totalNum;
      this._mergeCount.symbolList.push(symbol);
    }
    return this;
  }

  getResult() {
    let totalNum = 0;
    let totalValue = 0;
    for (const symbol of this._mergeCount.symbolList) {
      totalNum += Number.isNaN(this._mergeCount.mergeInfo[symbol].totalNum) ? 0 : Number(this._mergeCount.mergeInfo[symbol].totalNum);
      totalValue += Number.isNaN(this._mergeCount.mergeInfo[symbol].totalValue) ? 0 : Number(this._mergeCount.mergeInfo[symbol].totalValue);
    }

    this._mergeCount.totalNum = totalNum;
    this._mergeCount.totalValue = totalValue;
    this._mergeCount.avgPrice = this._mergeCount.totalValue / this._mergeCount.totalNum;

    
    for (const symbol of this._mergeCount.symbolList) {

      this._mergeCount.mergeInfo[symbol].rate = this._mergeCount.mergeInfo[symbol].totalNum / this._mergeCount.totalNum;
      this._mergeCount.mergeInfo[symbol].avgPrice = this._mergeCount.mergeInfo[symbol].totalValue / this._mergeCount.mergeInfo[symbol].totalNum;
    }

    return this;
  }

  get mergeCount() {
    const jsonObj = {
      symbol: this._symbolInfo.symbol,
      symbolInfo: this._symbolInfo,
      avgPrice: Number(this._mergeCount.avgPrice).toFixed(8),
      totalValue: Number(this._mergeCount.totalValue).toFixed(8),
      totalNum: Number(this._mergeCount.totalNum).toFixed(8),
      symbolList: this._mergeCount.symbolList,
      mergeInfo: {},
    };

    for (const symbol of this._mergeCount.symbolList) {
      if (!Object.keys(jsonObj.mergeInfo).includes(symbol)) {
        jsonObj.mergeInfo[symbol] = {};
      }
      
      jsonObj.mergeInfo[symbol] = {
        avgPrice: Number(this._mergeCount.mergeInfo[symbol].avgPrice).toFixed(8),
        totalValue: Number(this._mergeCount.mergeInfo[symbol].totalValue).toFixed(8),
        totalNum: Number(this._mergeCount.mergeInfo[symbol].totalNum).toFixed(8),
        rate: (Number(this._mergeCount.mergeInfo[symbol].rate) * 100).toFixed(2),
      };
    }

    return jsonObj;
  }

  getJSON() {
    return this.mergeCount;
  }
}

module.exports = MergeCounter;