class Counter {
  // #region 属性声明
  // 进程id
  _id = null;

  // 均价
  _avgPrice = 0;

  // 买家统计
  _buyerCount = {
    totalNum: 0,
    totalValue: 0,
  };

  // 卖家统计
  _sellerCount = {
    totalNum: 0,
    totalValue: 0,
  };

  // 手续费统计
  _commissionCount = {
    total: 0,
    buyer: {
      total: 0,
      maker: 0,
      notMaker: 0,
    },
    seller: {
      total: 0,
      maker: 0,
      notMaker: 0,
    },
  };
  // #endregion

  /**
   * Counter构造函数 - 初始化或更新交易统计计数器
   * @param {Object} params - 构造参数对象
   * @param {Object} [params.buyerCount] - 买家统计信息
   * @param {Number} [params.buyerCount.totalNum] - 买家交易总数量
   * @param {Number} [params.buyerCount.totalValue] - 买家交易总价值
   * @param {Object} [params.sellerCount] - 卖家统计信息
   * @param {Number} [params.sellerCount.totalNum] - 卖家交易总数量
   * @param {Number} [params.sellerCount.totalValue] - 卖家交易总价值
   * @param {Object} [params.commissionCount] - 手续费统计信息
   * @param {Number} [params.commissionCount.total] - 总手续费
   * @param {Object} [params.commissionCount.buyer] - 买家手续费
   * @param {Number} [params.commissionCount.buyer.total] - 买家总手续费
   * @param {Number} [params.commissionCount.buyer.maker] - 买家maker手续费
   * @param {Number} [params.commissionCount.buyer.notMaker] - 买家notMaker手续费
   * @param {Object} [params.commissionCount.seller] - 卖家手续费
   * @param {Number} [params.commissionCount.seller.total] - 卖家总手续费
   * @param {Number} [params.commissionCount.seller.maker] - 卖家maker手续费
   * @param {Number} [params.commissionCount.seller.notMaker] - 卖家notMaker手续费
   * @param {String} [params.id] - 计数器ID，不提供则自动生成
   * @example
   * -- 创建一个新的空计数器
   * const counter = new Counter();
   * 
   * -- 创建一个带有初始统计数据的计数器
   * const counter = new Counter({
   *   buyerCount: { totalNum: 10, totalValue: 1000 },
   *   sellerCount: { totalNum: 5, totalValue: 500 },
   *   id: 'custom-counter-id'
   * });
   */
  constructor({buyerCount, sellerCount, commissionCount, id}) {
    // 设置计数器ID，未提供则生成基于进程ID和时间戳的唯一ID
    this._id = id || process.pid + '-' + Date.now();

    // 初始化买家统计信息，未提供则使用默认值
    this._buyerCount = {
      totalNum: Number(buyerCount?.totalNum || this._buyerCount.totalNum),
      totalValue: Number(buyerCount?.totalValue || this._buyerCount.totalValue),
    };

    // 初始化卖家统计信息，未提供则使用默认值
    this._sellerCount = {
      totalNum: Number(sellerCount?.totalNum || this._sellerCount.totalNum),
      totalValue: Number(sellerCount?.totalValue || this._sellerCount.totalValue),
    };

    // 初始化手续费统计信息，未提供则使用默认值
    this._commissionCount = {
      total: Number(commissionCount?.total || this._commissionCount.total),
      buyer: {
        total: Number(commissionCount?.buyer?.total || this._commissionCount.buyer.total),  
        maker: Number(commissionCount?.buyer?.maker || this._commissionCount.buyer.maker),
        notMaker: Number(commissionCount?.buyer?.notMaker || this._commissionCount.buyer.notMaker),
      },
      seller: {
        total: Number(commissionCount?.seller?.total || this._commissionCount.seller.total),
        maker: Number(commissionCount?.seller?.maker || this._commissionCount.seller.maker),  
        notMaker: Number(commissionCount?.seller?.notMaker || this._commissionCount.seller.notMaker),
      },
    };

    // 当买家总数量不为0时计算均价
    if (this._buyerCount.totalNum !== 0 ) {
      this._avgPrice = this._buyerCount.totalValue / this._buyerCount.totalNum;
    }
  }

  get id() {
    return this._id;
  }

  get avgPrice() {
    return this._avgPrice.toFixed(8);
  }

  // 计算最新的均价
  calculateAvgPrice() {
    if (this._buyerCount.totalNum === 0) {
      this._avgPrice = 0;
      return;
    }

    this._avgPrice = this._buyerCount.totalValue / this._buyerCount.totalNum;
  }

  // #region Buyer相关
  /**
   * 添加Buyer统计中的交易数量（单位：USDT之类）
   * @param {Number} num 
   */
  addBuyerTotalNum(num) {
    this._buyerCount.totalNum += Number(num);
  }

  get buyerTotalNum() {
    return this._buyerCount.totalNum.toFixed(8);
  }

  /**
   * 添加Buyer统计中的交易价值（单位：USDT之类）
   * @param {Number} value 
   */
  addBuyerTotalValue(value) {
    this._buyerCount.totalValue += Number(value);
  }

  get buyerTotalValue() {
    return this._buyerCount.totalValue.toFixed(8);
  }
  // #endregion

  // #region Seller相关
  /**
   * 添加Seller统计中的交易数量（单位：USDT之类）
   * @param {Number} num 
   */
  addSellerTotalNum(num) {
    this._sellerCount.totalNum += Number(num);
  }

  get sellerTotalNum() {
    return this._sellerCount.totalNum.toFixed(8);
  }

  /**
   * 添加Seller统计中的交易价值（单位：USDT之类）
   * @param {Number} value 
   */
  addSellerTotalValue(value) {
    this._sellerCount.totalValue += Number(value);
  }

  get sellerTotalValue() {
    return this._sellerCount.totalValue.toFixed(8);
  }
  // #endregion

  // #region Commission相关

  /**
   * 添加Commission统计中的交易数量（单位：USDT之类）
   * @param {Number} num 
   */
  addCommissionTotalNum(num) {
    this._commissionCount.total += Number(num);
  }

  get commissionTotalNum() {
    return this._commissionCount.total.toFixed(8);
  }

  /**
   * 添加Commission统计中的Buyer交易数量（单位：USDT之类）
   * @param {Number} num 
   * @param {String} type 交易类型，maker或notMaker
   */
  addCommissionBuyerTotalNum(num, type) {
    this._commissionCount.buyer.total += Number(num);

    if (type === 'maker') {
      this._commissionCount.buyer.maker += Number(num);
    } else if (type === 'notMaker') {
      this._commissionCount.buyer.notMaker += Number(num);
    }
  }

  get commissionBuyerTotalNum() {
    return this._commissionCount.buyer.total.toFixed(8);
  }

  get commissionBuyerMakerNum() {
    return this._commissionCount.buyer.maker.toFixed(8);
  }

  get commissionBuyerNotMakerNum() {
    return this._commissionCount.buyer.notMaker.toFixed(8);
  }

  /**
   * 添加Commission统计中的Seller交易数量（单位：USDT之类）
   * @param {Number} num 
   * @param {String} type 交易类型，maker或notMaker
   */
  addCommissionSellerTotalNum(num, type) {
    this._commissionCount.seller.total += Number(num);

    if (type === 'maker') {
      this._commissionCount.seller.maker += Number(num);
    } else if (type === 'notMaker') {
      this._commissionCount.seller.notMaker += Number(num);
    }
  }

  get commissionSellerTotalNum() {
    return this._commissionCount.seller.total.toFixed(8);
  }

  get commissionSellerMakerNum() {
    return this._commissionCount.seller.maker.toFixed(8);
  }

  get commissionSellerNotMakerNum() {
    return this._commissionCount.seller.notMaker.toFixed(8);
  }
  // #endregion

  getJSON() {
    return {
      id: this._id,
      avgPrice: this.avgPrice,
      buyerCount: {
        totalNum: this.buyerTotalNum,
        totalValue: this.buyerTotalValue,
      },
      sellerCount: {
        totalNum: this.sellerTotalNum,
        totalValue: this.sellerTotalValue,
      },
      commissionCount: {
        totalNum: this.commissionTotalNum,
        buyer: {
          totalNum: this.commissionBuyerTotalNum,
          makerNum: this.commissionBuyerMakerNum,
          notMakerNum: this.commissionBuyerNotMakerNum,
        },
        seller: {
          totalNum: this.commissionSellerTotalNum,
          makerNum: this.commissionSellerMakerNum,
          notMakerNum: this.commissionSellerNotMakerNum,
        },
      },
    };
  }
}

module.exports = Counter;