# brick_wallet_cli

## 安装(Install)

```sh
npm i -g brick_wallet_cli
```

## 配置文件(Config)

命令行运行需要指定配置文件，配置文件示例(config.json)

```json
{
  "apiKey": "your_apikey",
  "apiSecret": "your_apisecret",
  "proxy": {
    "protocol": "http",
    "host": "127.0.0.1",
    "port": 3000
  },
  "symbolList": ["BTCUSDT"],
  "trade": {
    "BTCUSDT": {
      "fromId": 5350162147,
      "buyerCount": {
        "totalNum": "3.24918997",
        "totalValue": "25"
      }
    }
  },
  "merge_quote_currency": [
    "USDC",
    "FDUSD",
    "XUSD",
    "USDC"
  ]
}
```



## 使用(Usage)

```sh
# 获取帮助
bwc --help

# 查看版本
bwc version

# 获取账户币对信息
bwc getallorder

# 获取账户信息
bwc getaccount

# 获取服务器时间
bwc gettime
```

## TODO

- [x] 1.0.0
  - [x] 获取用户交易记录
  - [x] 计算均价
  - [ ] ~~统计各价位占比~~
  - [x] 表格输出
- [x] 1.1.0
  - [x] 添加命令行参数支持
  - [x] 升级cli-table到cli-table3
- [x] 1.2.0
  - [x] 添加各个币种占比计算
  - [x] 优化统计算法写法
  - [x] 添加获取服务器时间的方法
  - [x] 添加等价币对合并功能
  - [x] 更新文档
  - [x] 更新cli命令工具
- [x] 1.2.1
  - [x] 添加计算盈余功能