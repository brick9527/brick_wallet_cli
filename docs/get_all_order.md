# 获取所有订单

## 1. myTrades

### 接口

- API

```sh
GET /api/v3/myTrades
```

- 方法
`myTrades()`

### 返回内容

#### 内容示例

```json
[
  {
    "symbol": "BTCUSDT",
    "id": 5535327143,
    "orderId": 52479304656,
    "orderListId": -1,
    "price": "87382.12000000",
    "qty": "0.00121000",
    "quoteQty": "105.73236520",
    "commission": "0.00000121",
    "commissionAsset": "BTC",
    "time": 1763686224629,
    "isBuyer": true,
    "isMaker": false,
    "isBestMatch": true
  }
]
```

#### 字段说明

| 字段名          | 数据类型 | 含义说明                                                                 |
|-----------------|----------|--------------------------------------------------------------------------|
| `symbol`        | 字符串   | 交易对标识，`BTCUSDT` 代表「比特币（BTC）兑泰达币（USDT）」的交易对。     |
| `id`            | 数值     | 成交 ID（Trade ID），每一笔实际成交的唯一标识（与订单 ID 区分）。          |
| `orderId`       | 数值     | 订单 ID（Order ID），该成交所属原始订单的唯一标识，一个订单可能拆分多笔成交。 |
| `orderListId`   | 数值     | 订单列表 ID，仅用于 OCO 订单（取消其一订单），`-1` 表示非 OCO 订单。      |
| `price`         | 字符串   | 成交价格（计价货币为 USDT），用字符串避免浮点数精度丢失，此处为 87382.12 USDT/BTC。 |
| `qty`           | 字符串   | 成交数量（基础货币为 BTC），用字符串保精度，此处为 0.00121 BTC。          |
| `quoteQty`      | 字符串   | 成交额（计价货币为 USDT），计算公式为 `price × qty`，此处为 105.7323652 USDT。 |
| `commission`    | 字符串   | 交易手续费金额，用字符串保精度，此处为 0.00000121 BTC。                   |
| `commissionAsset` | 字符串  | 手续费结算资产类型，此处为 `BTC`，即手续费直接扣除 BTC。                  |
| `time`          | 数值     | 成交时间戳（毫秒级），可通过 `new Date(时间戳)` 转换为具体日期时间。      |
| `isBuyer`       | 布尔值   | 是否为买方，`true` 表示买入 BTC（卖出 USDT），`false` 为卖方。            |
| `isMaker`       | 布尔值   | 是否为做市商（Maker），`true` 是挂单（被动成交，低费率），`false` 是吃单（主动成交，费率略高）。 |
| `isBestMatch`   | 布尔值   | 是否最优价格成交，`true` 表示匹配当时市场最优买卖价格（无滑点）。          |

## 2. allOrders

### 返回内容

#### 内容示例
```json
[
  {
    "symbol": "BTCUSDT",
    "orderId": 50304181404,
    "orderListId": -1,
    "clientOrderId": "and_b4ce49a5f66b4f5fafd039c62d789daa",
    "price": "107713.00000000",
    "origQty": "0.00139000",
    "executedQty": "0.00000000",
    "cummulativeQuoteQty": "0.00000000",
    "status": "CANCELED",
    "timeInForce": "GTC",
    "type": "LIMIT",
    "side": "BUY",
    "stopPrice": "0.00000000",
    "icebergQty": "0.00000000",
    "time": 1760632677817,
    "updateTime": 1760632693100,
    "isWorking": true,
    "workingTime": 1760632677817,
    "origQuoteOrderQty": "0.00000000",
    "selfTradePreventionMode": "EXPIRE_MAKER"
  }
]
```

#### 字段说明

| 字段名                  | 数据类型 | 含义说明                                                                 |
|-------------------------|----------|--------------------------------------------------------------------------|
| `symbol`                | 字符串   | 交易对标识，`BTCUSDT` 代表「比特币（BTC）兑泰达币（USDT）」。             |
| `orderId`               | 数值     | 平台生成的订单唯一标识，此处为 50304181404。                              |
| `orderListId`           | 数值     | 订单列表 ID，`-1` 表示该订单非 OCO 关联订单（单独下单）。                  |
| `clientOrderId`         | 字符串   | 用户自定义/平台生成的客户端订单标识，用于用户本地追踪订单（此处为 `and_b4ce49a5f66b4f5fafd039c62d789daa`）。 |
| `price`                 | 字符串   | 订单委托价格（计价货币 USDT），用字符串保精度，此处为 107713.00 USDT/BTC。 |
| `origQty`               | 字符串   | 订单原始委托数量（基础货币 BTC），此处为 0.00139 BTC（未成交）。           |
| `executedQty`           | 字符串   | 订单已成交数量，`0.00000000` 表示该订单未发生任何成交。                   |
| `cummulativeQuoteQty`   | 字符串   | 累计成交额，因未成交故为 `0.00000000` USDT（计算公式：成交价格×成交数量）。 |
| `status`                | 字符串   | 订单状态，`CANCELED` 表示订单已被取消（其他常见状态：NEW 新建、FILLED 完全成交、PARTIALLY_FILLED 部分成交）。 |
| `timeInForce`           | 字符串   | 订单有效时间，`GTC` 表示「一直有效直至成交或取消」（常见类型：IOC 即时成交否则取消、FOK 全部成交否则取消）。 |
| `type`                  | 字符串   | 订单类型，`LIMIT` 表示「限价单」（按指定价格委托，需等待市场价格匹配）（其他类型：MARKET 市价单、STOP 止损单等）。 |
| `side`                  | 字符串   | 交易方向，`BUY` 表示「买入」（即买入 BTC、卖出 USDT），`SELL` 为卖出。     |
| `stopPrice`             | 字符串   | 止损/止盈触发价格，`0.00000000` 表示该订单非止损/止盈类型（仅 STOP 类订单需填写）。 |
| `icebergQty`            | 字符串   | 冰山委托数量，`0.00000000` 表示非冰山订单（冰山订单会隐藏部分委托量，避免影响市场价格）。 |
| `time`                  | 数值     | 订单创建时间戳（毫秒级），此处 `1760632677817` 对应 `timeLocal` 的 `2025-10-17 00:37:57`。 |
| `updateTime`            | 数值     | 订单最后更新时间戳（毫秒级），此处为订单取消的时间（1760632693100）。      |
| `isWorking`             | 布尔值   | 订单是否有效，`true` 表示订单在取消前处于有效状态（未失效）。              |
| `workingTime`           | 数值     | 订单生效时间戳，与 `time` 一致（新建订单即时生效）。                       |
| `origQuoteOrderQty`     | 字符串   | 原始委托成交额（计价货币），`0.00000000` 表示该订单以「数量」而非「金额」委托（部分订单支持按金额委托）。 |
| `selfTradePreventionMode` | 字符串  | 自成交防护模式，`EXPIRE_MAKER` 表示「触发自成交风险时，取消做市方订单」（避免同一账户双向成交）。 |