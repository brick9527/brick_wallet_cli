const { Spot, SPOT_REST_API_PROD_URL } = require('@binance/spot');

const config = require('../../config.json');

function getClient (proxyConfig) {
  const configurationRestAPI = {
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    basePath: config.basePath || SPOT_REST_API_PROD_URL,
    // isAutoTimestamp: true,  // 自动同步服务器时间
    // isCheckServerTime: true, // 检查服务器时间
    ...proxyConfig,
  };

  const client = new Spot({ configurationRestAPI });

  return client;
}

module.exports = getClient;
