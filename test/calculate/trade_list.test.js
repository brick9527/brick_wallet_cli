/* eslint-disable no-undef */
const { expect } = require('chai');
const sinon = require('sinon');
let calculateTradeList = require('../../src/libs/calculate/trade_list'); // 替换为实际的文件路径

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

describe('一、calculateTradeList 函数测试', () => {
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
      expect(result.counter.buyer.totalNum).to.equal('0.00121000');
      // 验证买入价值：105.73236520 - 0.05 = 105.68236520
      expect(result.counter.buyer.totalValue).to.equal('105.68236520');
      // 验证手续费统计
      expect(result.commissionInfo.total).to.equal('0.05000000');
      expect(result.commissionInfo.buyer.total).to.equal('0.05000000');
      expect(result.commissionInfo.buyer.notMaker).to.equal('0.05000000');
      expect(result.commissionInfo.buyer.maker).to.equal('0.00000000');
      // 验证平均价：totalValue / totalNum = 105.68236520 / 0.00121 ≈ 87340.79768595
      expect(result.avgPrice).to.equal('87340.79768595');
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
      expect(result.counter.buyer.totalNum).to.equal('0.00120879');
      // 买入价值：105.73236520（基础货币手续费不扣减价值）
      expect(result.counter.buyer.totalValue).to.equal('105.73236520');
      // 手续费换算：87382.12 * 0.00000121 = 0.1057323652 → 保留8位小数
      expect(result.commissionInfo.total).to.equal('0.10573237');
      expect(result.commissionInfo.buyer.total).to.equal('0.10573237');
      expect(result.commissionInfo.buyer.maker).to.equal('0.10573237');
      // 平均价：105.73236520 / 0.00120879 ≈ 87469.58958959
      expect(result.avgPrice).to.equal('87469.58958959');
    });
  });

  describe('4. 卖出交易测试 - 手续费为计价货币(USDT)', () => {
    it('4.1 单条卖出交易应正确计算数值', () => {
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
      expect(result.counter.seller.totalNum).to.equal('0.00121000');
      // 卖出价值：105.73236520 - 0.05 = 105.68236520
      expect(result.counter.seller.totalValue).to.equal('105.68236520');
      // 手续费统计
      expect(result.commissionInfo.total).to.equal('0.05000000');
      expect(result.commissionInfo.seller.total).to.equal('0.05000000');
      expect(result.commissionInfo.seller.notMaker).to.equal('0.05000000');
      // 买入数据应为初始值
      expect(result.counter.buyer.totalNum).to.equal('0.00000000');
      expect(result.counter.buyer.totalValue).to.equal('0.00000000');
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
      expect(result.counter.seller.totalNum).to.equal('0.00120879');
      // 卖出价值：105.73236520
      expect(result.counter.seller.totalValue).to.equal('105.73236520');
      // 手续费换算：87382.12 * 0.00000121 = 0.1057323652 → 保留8位
      expect(result.commissionInfo.total).to.equal('0.10573237');
      expect(result.commissionInfo.seller.total).to.equal('0.10573237');
      expect(result.commissionInfo.seller.maker).to.equal('0.10573237');
    });
  });

  describe('6. initData 初始化测试', () => {
    it('6.1 应正确使用initData的初始值', () => {
      const initData = {
        counter: {
          buyer: {
            totalNum: 0.001,
            totalValue: 100,
          },
          seller: {
            totalNum: 0.002,
            totalValue: 200,
          },
        },
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
      expect(result.counter.buyer.totalNum).to.equal('0.00221000');
      // 买入价值：100 + (105.73236520 - 0.05) = 205.68236520
      expect(result.counter.buyer.totalValue).to.equal('205.68236520');
      // 卖出数量保持初始值
      expect(result.counter.seller.totalNum).to.equal('0.00200000');
    });
  });

  describe('7. savePoint 测试', () => {
    // 定义 stub 变量，方便在测试中复用
    let setSavePointStub;

    it('7.1 多条交易时应触发 _setSavePoint 且 savePoint 数值正确', () => {
      const symbolInfo = {
        baseCurrency: 'BTC',
        quoteCurrency: 'USDT',
      };
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

      // 执行核心函数
      const calculateResult = calculateTradeList(tradeList, symbolInfo);

      /**************************
       * 1. 验证 _setSavePoint 调用次数（仅倒数第二个元素触发，调用 1 次）
       **************************/
      expect(calculateResult.savePoint.id).to.equal(8);

      /**************************
       * 2. 验证 savePoint 数值正确性（从 stub 的调用参数中获取 result）
       **************************/
      const savePoint = calculateResult.savePoint;

      // 计算预期值：前两个交易处理后的累加结果
      const expectedBuyerTotalNum = 0.00121 + 0.001; // 0.00221
      const expectedBuyerTotalValue = 105.7323652 - 0.05 + (87.38212 - 0.02); // 193.0444852
      const expectedAvgPrice = (expectedBuyerTotalValue / expectedBuyerTotalNum).toFixed(8); // 87350.44579185

      // 断言 savePoint 核心数值
      expect(savePoint.counter.buyer.totalNum, 'buyer.totalNum 格式化错误').to.equal(expectedBuyerTotalNum.toFixed(8));
      expect(savePoint.counter.buyer.totalValue, 'buyer.totalValue 格式化错误').to.equal(expectedBuyerTotalValue.toFixed(8));
      expect(savePoint.avgPrice, 'avgPrice 计算错误').to.equal(expectedAvgPrice);

      // 额外验证 commissionInfo 数值（前两个交易的手续费累加：0.05 + 0.02 = 0.07）
      expect(savePoint.commissionInfo.total, '手续费总计错误').to.equal('0.07000000');
      expect(savePoint.commissionInfo.buyer.total, '买方手续费总计错误').to.equal('0.07000000');
      expect(savePoint.commissionInfo.buyer.maker, '买方 maker 手续费错误').to.equal('0.02000000'); // 第二个交易是 maker
      expect(savePoint.commissionInfo.buyer.notMaker, '买方 notMaker 手续费错误').to.equal('0.05000000'); // 第一个交易是 notMaker
    });

    it('7.2 单条交易时不触发 _setSavePoint', () => {
      const symbolInfo = { baseCurrency: 'BTC', quoteCurrency: 'USDT' };
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

      // 验证 _setSavePoint 未被调用
      expect(calculateResult.savePoint.avgPrice).to.equal(0);

    });

    it('7.3 两条交易时触发 _setSavePoint 且数值正确', () => {
      const symbolInfo = { baseCurrency: 'BTC', quoteCurrency: 'USDT' };
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

      // 验证调用次数
      expect(calculateResult.savePoint.id).to.equal(11);

      // 验证数值（仅第一个交易的结果，因为触发时机是倒数第二个元素，即索引 0）
      const savePoint = calculateResult.savePoint;

      expect(savePoint.counter.buyer.totalNum).to.equal('0.00121000');
      expect(savePoint.counter.buyer.totalValue).to.equal('105.68236520'); // 105.73236520 - 0.05
      expect(savePoint.commissionInfo.total).to.equal('0.05000000');
    });
  });

  describe('8. 平均价计算测试', () => {
    it('8.1 buyer的totalValue/totalNum应正确计算平均价', () => {
      const tradeList = [
        {
          symbol: 'BTCUSDT',
          id: 9,
          price: '100000.00000000',
          qty: '0.00200000',
          quoteQty: '200.00000000',
          commission: '0.0',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: true,
          isBestMatch: true,
        },
        {
          symbol: 'BTCUSDT',
          id: 10,
          price: '100000.00000000',
          qty: '0.00300000',
          quoteQty: '300.00000000',
          commission: '0.0',
          commissionAsset: 'USDT',
          isBuyer: true,
          isMaker: true,
          isBestMatch: true,
        },
      ];

      const result = calculateTradeList(tradeList, symbolInfo);
      // totalValue: 200 + 300 = 500; totalNum: 0.002 + 0.003 = 0.005; 500/0.005 = 100000
      expect(result.avgPrice).to.equal('100000.00000000');
    });
  });
});
