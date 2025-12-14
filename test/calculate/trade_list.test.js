/* eslint-disable no-undef */
const { expect } = require('chai');
const sinon = require('sinon');
let calculateTradeList = require('../../src/libs/calculate/trade_list');

// 模拟 logger 避免运行时报错
before(() => {
  process.brickWalletCli = {
    ctx: {
      logger: {
        debug: sinon.stub(),
      },
    },
  };
});

// 重置 stub
afterEach(() => {
  sinon.reset();
});

describe('一、calculateTradeList 函数测试（加强版）', () => {
  // 基础测试数据
  const symbolInfo = {
    status: true,
    symbol: 'BTCUSDT',
    baseCurrency: 'BTC',
    quoteCurrency: 'USDT',
  };

  describe('1. 边界条件测试', () => {
    it('1.1 tradeList 为空时应抛出错误', () => {
      expect(() => calculateTradeList([], symbolInfo)).to.throw('tradeList 不能为空');
    });
    
    it('1.2 tradeList 只有一条交易时应正确处理', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 1,
          price: '87382.12000000',
          qty: '0.00121000',
          quoteQty: '105.73236520',
          commission: '0.05',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: false,
          isBestMatch: true,
        },
      ];

      const result = calculateTradeList(tradeList, symbolInfo);
      expect(result.firstIInfo).to.deep.equal(tradeList[0]);
      expect(result.lastInfo).to.deep.equal(tradeList[0]);
    });
  });

  describe('2. 买入交易测试 - 手续费为计价货币(USDT)', () => {
    it('2.1 单条买入交易应正确计算数值', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 1,
          price: '87382.12000000',
          qty: '0.00121000',
          quoteQty: '105.73236520',
          commission: '0.05',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: false,
          isBestMatch: true,
        },
      ];

      const result = calculateTradeList(tradeList, symbolInfo);

      // 验证买入数量：初始0 + 0.00121000
      expect(result.buyerCount.totalNum).to.equal('0.00121000');
      
      // 验证买入价值：105.73236520 - 0.05 = 105.68236520
      expect(result.buyerCount.totalValue).to.equal('105.68236520');

      // 验证手续费统计
      expect(result.commissionCount.totalNum).to.equal('0.05000000');
      expect(result.commissionCount.buyer.totalNum).to.equal('0.05000000');
      expect(result.commissionCount.buyer.notMakerNum).to.equal('0.05000000');
      expect(result.commissionCount.buyer.makerNum).to.equal('0.00000000');
      expect(result.commissionCount.seller.totalNum).to.eq('0.00000000');
      expect(result.commissionCount.seller.notMakerNum).to.eq('0.00000000');
      expect(result.commissionCount.seller.makerNum).to.eq('0.00000000');

      // 验证首尾信息
      expect(result.firstIInfo).to.deep.equal(tradeList[0]);
      expect(result.lastInfo).to.deep.equal(tradeList[0]);
    });
  });

  describe('3. 买入交易测试 - 手续费为基础货币(BTC)', () => {
    it('3.1 单条买入交易应正确计算数值', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 2,
          price: '87382.12000000',
          qty: '0.00121000',
          quoteQty: '105.73236520',
          commission: '0.00000121',
          commissionAsset: 'BTC',
          isBuyer: true,
          isMaker: true,
          isBestMatch: true,
        },
      ];

      const result = calculateTradeList(tradeList, symbolInfo);

      // 买入数量：0.00121 - 0.00000121 = 0.00120879
      expect(result.buyerCount.totalNum).to.equal('0.00120879');
      // 买入价值：105.73236520（基础货币手续费不扣减价值）
      expect(result.buyerCount.totalValue).to.equal('105.73236520');
      // 手续费换算：87382.12 * 0.00000121 = 0.1057323652 → 保留8位小数
      expect(result.commissionCount.totalNum).to.equal('0.10573237');
      expect(result.commissionCount.buyer.totalNum).to.equal('0.10573237');
      expect(result.commissionCount.buyer.makerNum).to.equal('0.10573237');
    });
  });

  describe('4. 卖出交易测试 - 手续费为计价货币(USDT)', () => {
    it('4.1 单条卖出交易(isMaker=false)应正确计算数值', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 3,
          price: '87382.12000000',
          qty: '0.00121000',
          quoteQty: '105.73236520',
          commission: '0.05',
          commissionAsset: 'USDT',
          isBuyer: false,
          isMaker: false,
          isBestMatch: true,
        },
      ];

      const result = calculateTradeList(tradeList, symbolInfo);

      // 卖出数量：0 + 0.00121000
      expect(result.sellerCount.totalNum).to.equal('0.00121000');
      // 卖出价值：105.73236520 - 0.05 = 105.68236520
      expect(result.sellerCount.totalValue).to.equal('105.68236520');
      // 手续费统计
      expect(result.commissionCount.totalNum).to.equal('0.05000000');
      expect(result.commissionCount.seller.totalNum).to.equal('0.05000000');
      expect(result.commissionCount.seller.notMakerNum).to.equal('0.05000000');
      // 买入数据应为初始值
      expect(result.buyerCount.totalNum).to.equal('0.00000000');
      expect(result.buyerCount.totalValue).to.equal('0.00000000');
    });
    
    it('4.2 单条卖出交易(isMaker=true)应正确计算数值', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 4,
          price: '87382.12000000',
          qty: '0.00121000',
          quoteQty: '105.73236520',
          commission: '0.05',
          commissionAsset: 'USDT',
          isBuyer: false,
          isMaker: true,
          isBestMatch: true,
        },
      ];

      const result = calculateTradeList(tradeList, symbolInfo);

      // 卖出数量：0 + 0.00121000
      expect(result.sellerCount.totalNum).to.equal('0.00121000');
      // 卖出价值：105.73236520 - 0.05 = 105.68236520
      expect(result.sellerCount.totalValue).to.equal('105.68236520');
      // 手续费统计
      expect(result.commissionCount.totalNum).to.equal('0.05000000');
      expect(result.commissionCount.seller.totalNum).to.equal('0.05000000');
      expect(result.commissionCount.seller.makerNum).to.equal('0.05000000');
    });
  });

  describe('5. 卖出交易测试 - 手续费为基础货币(BTC)', () => {
    it('5.1 单条卖出交易应正确计算数值', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 4,
          price: '87382.12000000',
          qty: '0.00121000',
          quoteQty: '105.73236520',
          commission: '0.00000121',
          commissionAsset: 'BTC',
          isBuyer: false,
          isMaker: true,
          isBestMatch: true,
        },
      ];

      const result = calculateTradeList(tradeList, symbolInfo);

      // 卖出数量：0.00121 - 0.00000121 = 0.00120879
      expect(result.sellerCount.totalNum).to.equal('0.00120879');
      // 卖出价值：105.73236520
      expect(result.sellerCount.totalValue).to.equal('105.73236520');
      // 手续费换算：87382.12 * 0.00000121 = 0.1057323652 → 保留8位
      expect(result.commissionCount.totalNum).to.equal('0.10573237');
      expect(result.commissionCount.seller.totalNum).to.equal('0.10573237');
      expect(result.commissionCount.seller.makerNum).to.equal('0.10573237');
    });
  });

  describe('6. 混合交易测试', () => {
    it('6.1 先买入后卖出交易应正确计算数值', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 12,
          price: '87382.12000000',
          qty: '0.00121000',
          quoteQty: '105.73236520',
          commission: '0.05',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: false,
          isBestMatch: true,
        },
        {
          symbol: 'BTCUSDT',
          id: 13,
          price: '88000.00000000',
          qty: '0.00121000',
          quoteQty: '106.48000000',
          commission: '0.05324',
          commissionAsset: 'USDT',
          isBuyer: false,
          isMaker: true,
          isBestMatch: true,
        },
      ];

      const result = calculateTradeList(tradeList, symbolInfo);

      // 验证买入数量和价值
      expect(result.buyerCount.totalNum).to.equal('0.00121000');
      expect(result.buyerCount.totalValue).to.equal('105.68236520');
      
      // 验证卖出数量和价值
      expect(result.sellerCount.totalNum).to.equal('0.00121000');
      expect(result.sellerCount.totalValue).to.equal('106.42676000');
      
      // 验证手续费统计
      expect(result.commissionCount.totalNum).to.equal('0.10324000');
      expect(result.commissionCount.buyer.totalNum).to.equal('0.05000000');
      expect(result.commissionCount.seller.totalNum).to.equal('0.05324000');
      expect(result.commissionCount.seller.makerNum).to.equal('0.05324000');
    });
    
    it('6.2 多条混合交易应正确计算数值', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 14,
          price: '87382.12000000',
          qty: '0.00100000',
          quoteQty: '87.38212000',
          commission: '0.04369106',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: false,
          isBestMatch: true,
        },
        {
          symbol: 'BTCUSDT',
          id: 15,
          price: '87500.00000000',
          qty: '0.00200000',
          quoteQty: '175.00000000',
          commission: '0.00000200',
          commissionAsset: 'BTC',
          isBuyer: true,
          isMaker: true,
          isBestMatch: true,
        },
        {
          symbol: 'BTCUSDT',
          id: 16,
          price: '88000.00000000',
          qty: '0.00150000',
          quoteQty: '132.00000000',
          commission: '0.06600000',
          commissionAsset: 'USDT',
          isBuyer: false,
          isMaker: false,
          isBestMatch: true,
        },
      ];

      const result = calculateTradeList(tradeList, symbolInfo);

      // 验证买入数量和价值
      expect(result.buyerCount.totalNum).to.equal('0.00299800'); // 0.001 + (0.002 - 0.000002)
      expect(result.buyerCount.totalValue).to.equal('262.33842894'); // (87.38212 - 0.04369106) + 175
      
      // 验证卖出数量和价值
      expect(result.sellerCount.totalNum).to.equal('0.00150000');
      expect(result.sellerCount.totalValue).to.equal('131.93400000'); // 132 - 0.066
      
      // 验证手续费统计
      expect(result.commissionCount.totalNum).to.equal('0.28469106'); // 0.04369106 + (87500 * 0.000002) + 0.066
    });
  });

  describe('7. initData 初始化测试', () => {
    it('7.1 应正确使用initData的初始值(包含commissionCount)', () => {
      const initData = {
        buyerCount: {
          totalNum: 0.001,
          totalValue: 100,
        },
        sellerCount: {
          totalNum: 0.002,
          totalValue: 200,
        },
        commissionCount: {
          total: 0.1,
          buyer: {
            total: 0.05,
            maker: 0.02,
            notMaker: 0.03
          },
          seller: {
            total: 0.05,
            maker: 0.01,
            notMaker: 0.04
          }
        }
      };

      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 5,
          price: '87382.12000000',
          qty: '0.00121000',
          quoteQty: '105.73236520',
          commission: '0.05',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: false,
          isBestMatch: true,
        },
      ];

      const result = calculateTradeList(tradeList, symbolInfo, initData);

      // 买入数量：0.001 + 0.00121 = 0.00221
      expect(result.buyerCount.totalNum).to.equal('0.00221000');
      // 买入价值：100 + (105.73236520 - 0.05) = 205.68236520
      expect(result.buyerCount.totalValue).to.equal('205.68236520');
      // 卖出数量保持初始值
      expect(result.sellerCount.totalNum).to.equal('0.00200000');
      // 验证手续费统计
      expect(result.commissionCount.totalNum).to.equal('0.15000000'); // 0.1 + 0.05
      expect(result.commissionCount.buyer.totalNum).to.equal('0.10000000'); // 0.05 + 0.05
      expect(result.commissionCount.buyer.notMakerNum).to.equal('0.08000000'); // 0.03 + 0.05
    });
  });

  describe('8. savePoint 测试', () => {

    it('8.1 多条交易时应在倒数第二个节点存储savePoint', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 6,
          price: '87382.12000000',
          qty: '0.00121000',
          quoteQty: '105.73236520',
          commission: '0.05',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: false,
          isBestMatch: true,
        },
        {
          symbol: 'BTCUSDT',
          id: 7,
          price: '87382.12000000',
          qty: '0.00100000',
          quoteQty: '87.38212000',
          commission: '0.02',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: true,
          isBestMatch: true,
        },
        {
          symbol: 'BTCUSDT',
          id: 8,
          price: '87382.12000000',
          qty: '0.00050000',
          quoteQty: '43.69106000',
          commission: '0.01',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: false,
          isBestMatch: true,
        },
      ];

      const calculateResult = calculateTradeList(tradeList, symbolInfo);

      expect(calculateResult.savePoint.id).to.equal(8);

      const savePoint = calculateResult.savePoint;

      // 计算预期值：前两个交易处理后的累加结果
      const expectedBuyerTotalNum = 0.00121 + 0.001; // 0.00221
      const expectedBuyerTotalValue = 105.7323652 - 0.05 + (87.38212 - 0.02); // 193.0444852

      expect(savePoint.buyerCount.totalNum).to.equal(expectedBuyerTotalNum.toFixed(8));
      expect(savePoint.buyerCount.totalValue).to.equal(expectedBuyerTotalValue.toFixed(8));

      // 验证手续费统计
      expect(savePoint.commissionCount.totalNum).to.equal('0.07000000');
      expect(savePoint.commissionCount.buyer.totalNum).to.equal('0.07000000');
      expect(savePoint.commissionCount.buyer.makerNum).to.equal('0.02000000');
      expect(savePoint.commissionCount.buyer.notMakerNum).to.equal('0.05000000');
    });

    it('8.2 单条交易时savePoint应只包含id字段', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 9,
          price: '87382.12000000',
          qty: '0.00121000',
          quoteQty: '105.73236520',
          commission: '0.05',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: false,
          isBestMatch: true,
        },
      ];

      const calculateResult = calculateTradeList(tradeList, symbolInfo);

      // 验证 savePoint 只包含 id 字段
      expect(calculateResult.savePoint.id).to.equal(9);
      expect(calculateResult.savePoint).to.not.have.property('buyerCount');
      expect(calculateResult.savePoint).to.not.have.property('sellerCount');
      expect(calculateResult.savePoint).to.not.have.property('commissionCount');
      
      // 验证其他计算结果正确
      expect(calculateResult.buyerCount.totalNum).to.equal('0.00121000');
      expect(calculateResult.buyerCount.totalValue).to.equal('105.68236520');
      expect(calculateResult.commissionCount.totalNum).to.equal('0.05000000');
    });

    it('8.3 两条交易时savePoint应包含第一条交易的结果', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 10,
          price: '87382.12000000',
          qty: '0.00121000',
          quoteQty: '105.73236520',
          commission: '0.05',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: false,
          isBestMatch: true,
        },
        {
          symbol: 'BTCUSDT',
          id: 11,
          price: '87382.12000000',
          qty: '0.00100000',
          quoteQty: '87.38212000',
          commission: '0.02',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: true,
          isBestMatch: true,
        },
      ];

      const calculateResult = calculateTradeList(tradeList, symbolInfo);

      expect(calculateResult.savePoint.id).to.equal(11);

      // 验证数值（仅第一个交易的结果）
      const savePoint = calculateResult.savePoint;

      expect(savePoint.buyerCount.totalNum).to.equal('0.00121000');
      expect(savePoint.buyerCount.totalValue).to.equal('105.68236520'); // 105.73236520 - 0.05
      expect(savePoint.commissionCount.totalNum).to.equal('0.05000000');
    });
  });
});
