#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const packageJson = require('./package.json');
const updateNotifier = require('update-notifier');

updateNotifier({ pkg: packageJson }).notify();

const program = new Command();

const path = require('path');

function _checkConfig(options) {
  if (!options?.config) {
    throw new Error ('需要指定配置文件. 详见 --help');
  }
  
  let configPath = path.join(process.cwd(), options.config);
  if (path.isAbsolute(options.config)) {
    configPath = options.config;
  }

  const config = require(configPath);

  return config;
}

program.name('bwc')
  .description('a wallet cli tool')
  .version(packageJson.version);

// getaccount
program.command('getaccount')
  .description('获取账户信息')
  .requiredOption('-c, --config <path>', '指定配置文件')
  .action((options) => {
    const config = _checkConfig(options);
    require('./bin/get_account')(config);
  });

// getallorder
program.command('getallorder')
  .description('获取账户全部交易记录，计算各币对成本价')
  .requiredOption('-c, --config <path>', '指定配置文件')
  .action((options) => {
    const config = _checkConfig(options);
    require('./bin/get_all_order')(config);
  });

// gettime
program.command('gettime')
  .description('获取服务器时间')
  .action(() => {
    require('./bin/get_time')();
  });

program.command('getsma')
  .description('获取日均线')
  .requiredOption('-d, --days <number>', '获取n日均线')
  .requiredOption('-c, --config <path>', '指定配置文件')
  .option('-o, --output <path>', '指定输出JSON文件的路径')
  .option('--enable-grid-price', '计算网格价', true)
  .action((options) => {
    const config = _checkConfig(options);

    require('./bin/get_sma')({
      dayRange: Number(options.days),
      enableGridPrice: options.enableGridPrice,
      config,
      output: options.output,
    });
  });

program.parse();

// const options = program.opts();
// const limit = options.first ? 1 : undefined;
// console.log(options);
// console.log(program.args[0].split(options.separator, limit));