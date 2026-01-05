require('dotenv').config({ debug: false });
require('../src/libs/init_process')(process, 'genconfig');

const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

const getTargetPath = require('../src/libs/get_target_path');

function _loadFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error loading file ${filePath}: ${error.message}`);
    return null;
  }
}

async function runGenerateConfig({ useDefault = false, output } = {}) {
  const { logger } = process.brickWalletCli.ctx;
  const targetPath = getTargetPath(output);

  // 读取默认配置文件
  const configSampleJSON = _loadFile(path.join(__dirname, '../config.sample.json'));
  if (!configSampleJSON) {
    logger.error('读取config.sample.json失败');
    return;
  }

  // 生成配置文件
  if (useDefault) {
    fs.writeFileSync(targetPath, JSON.stringify(configSampleJSON, null, 2));
    logger.info(`配置文件生成地址: ${targetPath}`);
    return;
  }

  // #region 进入问答模式
  // apiKey
  const apiKey = await prompts({
    type: 'text',
    name: 'value',
    message: '请输入您的API Key:',
    validate: (value) => value.length > 0 || '请输入API Key',
  });

  // apiSecret
  const secretKey = await prompts({
    type: 'text',
    name: 'value',
    message: '请输入您的Secret Key:',
    validate: (value) => value.length > 0 || '请输入Secret Key',
  });

  // 是否存在代理
  const hasProxy = await prompts({
    type: 'confirm',
    name: 'value',
    message: '是否存在代理?',
    initial: false,
  });

  let proxy = {
    host: '',
    port: '',
    protocol: '',
  };
  if (hasProxy) {
    const host = await prompts({
      type: 'text',
      name: 'value',
      message: `请输入代理主机:(默认: ${configSampleJSON.proxy.host})`,
      initial: configSampleJSON.proxy.host,
      validate: (value) => value.length > 0 || '请输入代理主机',
    });

    const port = await prompts({
      type: 'number',
      name: 'value',
      message: `请输入代理端口:`,
      min: 0,
      max: 65535,
      validate: (port) => {
        return Boolean(port) || '请输入代理端口';
      },
    });
    const protocol = await prompts({
      type: 'text',
      name: 'value',
      message: `请输入代理协议:(默认: ${configSampleJSON.proxy.protocol})`,
      initial: configSampleJSON.proxy.protocol,
      validate: (value) => {
        return value.length > 0 || '请输入代理协议'
      },
    });

    proxy.host = host.value;
    proxy.port = Number(port.value);
    proxy.protocol = protocol.value;
  }

  // 监听币对
  const symbolContent = await prompts({
    type: 'text',
    name: 'value',
    message: `请输入监听的币对:(如: ${configSampleJSON.symbolList.join(',')}, 多个币对之间用逗号分割)`,
    validate: (value) => value.length > 0 || '请输入监听的币对',
  });
  const symbolList = symbolContent.value.split(',').filter(Boolean).map((item) => item.trim());
 
  // 要合并的本位币
  const quoteCurrency = await prompts({
    type: 'multiselect',
    name: 'value',
    message: `请输入要合并的本位币:(默认: ${configSampleJSON.merge_quote_currency.join(',')})`,
    choices: [
      { title: 'USDC', value: 'USDC', selected: true },
      { title: 'FDUSD', value: 'FDUSD', selected: true },
      { title: 'XUSD', value: 'XUSD', selected: true }
    ],
  });

  logger.debug(`apiKey: ${apiKey.value}`);
  logger.debug(`secretKey: ${secretKey.value}`);
  logger.debug(`hasProxy: ${hasProxy.value}`);
  logger.debug(`proxy: ${JSON.stringify(proxy)}`);
  logger.debug(`symbolList: ${symbolList}`);
  logger.debug(`quoteCurrencyList: ${quoteCurrency.value}`);

  const config = {
    apiKey: apiKey.value,
    secretKey: secretKey.value,
    proxy,
    symbolList,
    trade: {},
    merge_quote_currency: quoteCurrency.value,
  };
  // #endregion

  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2));
  logger.info(`配置文件生成地址: ${targetPath}`);
}

if (require.main === module) {
  runGenerateConfig();
}

module.exports = runGenerateConfig;