class Counter {
  // #region 属性声明
  // 进程id
  _id = null;

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

  // 构造函数
  constructor({buyerCount, sellerCount, commissionCount, id}) {
    this._id = id || process.pid + '-' + Date.now();

    this._buyerCount = {
      totalNum: buyerCount?.totalNum || this._buyerCount.totalNum,
      totalValue: buyerCount?.totalValue || this._buyerCount.totalValue,
    };

    this._sellerCount = {
      totalNum: sellerCount?.totalNum || this._sellerCount.totalNum,
      totalValue: sellerCount?.totalValue || this._sellerCount.totalValue,
    };

    this._commissionCount = {
      total: commissionCount?.total || this._commissionCount.total,
      buyer: {
        total: commissionCount?.buyer?.total || this._commissionCount.buyer.total,
        maker: commissionCount?.buyer?.maker || this._commissionCount.buyer.maker,
        notMaker: commissionCount?.buyer?.notMaker || this._commissionCount.buyer.notMaker,
      },
      seller: {
        total: commissionCount?.seller?.total || this._commissionCount.seller.total,
        maker: commissionCount?.seller?.maker || this._commissionCount.seller.maker,  
        notMaker: commissionCount?.seller?.notMaker || this._commissionCount.seller.notMaker,
      },
    };
  }

  get id() {
    return this._id;
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
