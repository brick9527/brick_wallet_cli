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

  /**
   * MergeCounter 类的构造函数
   * 
   * 初始化合并计数器实例，设置基础交易对信息并为所有可合并的交易对
   * 预创建统计信息结构。
   * 
   * @param {Object} params - 构造参数对象
   * @param {Object} params.symbolInfo - 基础交易对信息对象
   * @param {string} params.symbolInfo.symbol - 基础交易对符号（如 BTCUSDT）
   * @param {string} params.symbolInfo.baseCurrency - 基础货币（如 BTC）
   * @param {string} params.symbolInfo.quoteCurrency - 计价货币（如 USDT）
   * @param {Array<string>} [params.mergeQuoteCurrency=[]] - 可合并的计价货币列表，一般从配置文件中获取
   * 
   * @example
   * -- 创建一个合并 BTCUSDT 和 BTCEUR 交易对的计数器
   * const mergeCounter = new MergeCounter({
   *   symbolInfo: {
   *     symbol: 'BTCUSDT',
   *     baseCurrency: 'BTC',
   *     quoteCurrency: 'USDT'
   *   },
   *   mergeQuoteCurrency: ['EUR'] // 将生成 BTCEUR 作为可合并交易对
   * });
   * 
   * -- 创建一个只包含基础交易对的计数器
   * const mergeCounter = new MergeCounter({
   *   symbolInfo: {
   *     symbol: 'ETHUSDT',
   *     baseCurrency: 'ETH',
   *     quoteCurrency: 'USDT'
   *   }
   *   // mergeQuoteCurrency 默认为空数组
   * });
   */
  constructor({ symbolInfo, mergeQuoteCurrency = [] }) {
    // 初始化基础交易对信息
    this._symbolInfo = {
      symbol: symbolInfo.symbol,
      baseCurrency: symbolInfo.baseCurrency,
      quoteCurrency: symbolInfo.quoteCurrency,
    };

    // 为基础交易对初始化合并信息统计结构
    this._mergeCount.mergeInfo[this._symbolInfo.symbol] = {
      avgPrice: 0,
      totalValue: 0,
      totalNum: 0,
      rate: 0,
    };

    // 处理可合并的计价货币列表，生成对应的交易对符号并初始化统计结构
    this._mergeSymbolList = mergeQuoteCurrency.map((item) => {
      // 生成可合并交易对的符号（如 BTC + EUR = BTCEUR）
      const mergeSymbol = `${this._symbolInfo.baseCurrency}${item}`;
      
      // 为可合并交易对初始化合并信息统计结构
      this._mergeCount.mergeInfo[mergeSymbol] = {
        avgPrice: 0,
        totalValue: 0,
        totalNum: 0,
        rate: 0,
      };
      
      // 返回生成的交易对符号，用于构建可合并交易对列表
      return mergeSymbol;
    });
  }

  /**
   * 向合并计数器添加一个交易对的统计信息
   * 
   * 该方法用于将单个交易对的统计数据添加到合并计数器中。只有当交易对是基础交易对
   * 或者在可合并交易对列表中时，才会处理该交易对的信息。
   * 
   * @param {Object} params - 交易对统计信息参数对象
   * @param {string} params.symbol - 交易对符号（如 BTCUSDT）
   * @param {number} params.avgPrice - 该交易对的平均价格
   * @param {number} params.totalValue - 该交易对的总价值
   * @param {number} params.totalNum - 该交易对的总数量
   * 
   * @returns {MergeCounter} 当前 MergeCounter 实例，支持链式调用
   * 
   * @example
   * -- 添加 BTCUSDT 交易对的统计信息
   * mergeCounter.add({
   *   symbol: 'BTCUSDT',
   *   avgPrice: 45000,
   *   totalValue: 450000,
   *   totalNum: 10
   * });
   * 
   * -- 链式调用示例
   * mergeCounter
   *   .add({ symbol: 'BTCUSDT', avgPrice: 45000, totalValue: 450000, totalNum: 10 })
   *   .add({ symbol: 'BTCETH', avgPrice: 20, totalValue: 200, totalNum: 10 })
   *   .getResult();
   */
  add({ symbol, avgPrice, totalValue, totalNum }) {
    // 检查交易对是否是基础交易对或在可合并列表中
    if (symbol === this._symbolInfo.symbol || this._mergeSymbolList.includes(symbol)) {
      // 更新该交易对的统计信息
      this._mergeCount.mergeInfo[symbol].avgPrice = avgPrice;
      this._mergeCount.mergeInfo[symbol].totalValue = totalValue;
      this._mergeCount.mergeInfo[symbol].totalNum = totalNum;
      // 将交易对添加到已处理列表中
      this._mergeCount.symbolList.push(symbol);
    }
    // 返回当前实例，支持链式调用
    return this;
  }

  /**
   * 计算并生成合并后的交易对统计结果
   * 
   * 该方法执行以下操作：
   * 1. 计算所有参与合并的交易对的总数量和总价值
   * 2. 计算合并后的平均价格（总价值 / 总数量）
   * 3. 为每个交易对计算其数量占总数量的比例
   * 4. 重新计算每个交易对的平均价格（确保数据一致性）
   * 
   * 注意：调用此方法后，所有统计数据将被更新并保存到 `_mergeCount` 属性中。
   * 该方法支持链式调用，返回当前 MergeCounter 实例。
   * 
   * @returns {MergeCounter} 当前 MergeCounter 实例，支持链式调用
   */
  getResult() {
    // 计算所有参与合并的交易对的总数量和总价值
    let totalNum = 0;
    let totalValue = 0;
    for (const symbol of this._mergeCount.symbolList) {
      // 累加总数量，处理可能的 NaN 值
      totalNum += Number.isNaN(this._mergeCount.mergeInfo[symbol].totalNum) ? 0 : Number(this._mergeCount.mergeInfo[symbol].totalNum);
      // 累加总价值，处理可能的 NaN 值
      totalValue += Number.isNaN(this._mergeCount.mergeInfo[symbol].totalValue) ? 0 : Number(this._mergeCount.mergeInfo[symbol].totalValue);
    }

    // 更新合并后的总数量、总价值和平均价格
    this._mergeCount.totalNum = totalNum;
    this._mergeCount.totalValue = totalValue;
    this._mergeCount.avgPrice = this._mergeCount.totalValue / this._mergeCount.totalNum;

    // 为每个交易对计算其占比和平均价格
    for (const symbol of this._mergeCount.symbolList) {
      // 计算当前交易对数量占总数量的比例
      this._mergeCount.mergeInfo[symbol].rate = this._mergeCount.mergeInfo[symbol].totalNum / this._mergeCount.totalNum;
      // 重新计算当前交易对的平均价格（确保数据一致性）
      this._mergeCount.mergeInfo[symbol].avgPrice = this._mergeCount.mergeInfo[symbol].totalValue / this._mergeCount.mergeInfo[symbol].totalNum;
    }

    // 返回当前实例，支持链式调用
    return this;
  }

  /**
   * 获取格式化后的合并计数结果
   * 
   * 该方法返回一个包含合并后的交易数据的JSON对象，所有数值都经过格式化处理：
   * - 价格和数量类数值保留8位小数
   * - 比率数值转换为百分比形式并保留2位小数
   * 
   * @returns {Object} 格式化后的合并计数结果
   * @property {string} symbol - 基础交易对符号
   * @property {Object} symbolInfo - 基础交易对详细信息
   * @property {string} symbolInfo.symbol - 交易对符号
   * @property {string} symbolInfo.baseCurrency - 基础货币
   * @property {string} symbolInfo.quoteCurrency - 计价货币
   * @property {string} avgPrice - 合并后的平均价格（保留8位小数）
   * @property {string} totalValue - 合并后的总价值（保留8位小数）
   * @property {string} totalNum - 合并后的总数量（保留8位小数）
   * @property {Array} symbolList - 参与合并的交易对列表
   * @property {Object} mergeInfo - 各交易对的详细合并信息
   * @property {Object} mergeInfo[symbol] - 特定交易对的合并信息
   * @property {string} mergeInfo[symbol].avgPrice - 该交易对的平均价格（保留8位小数）
   * @property {string} mergeInfo[symbol].totalValue - 该交易对的总价值（保留8位小数）
   * @property {string} mergeInfo[symbol].totalNum - 该交易对的总数量（保留8位小数）
   * @property {string} mergeInfo[symbol].rate - 该交易对数量占总数量的百分比（保留2位小数）
   */
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