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