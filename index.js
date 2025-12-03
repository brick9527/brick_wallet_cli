#!/usr/bin/env node
'use strict';
const meow = require('meow');
const path = require('path');

function _checkConfig(options) {
  if (!options?.config) {
    throw new Error ('需要指定配置文件. 详见 --help');
  }

  const configPath = path.join(__dirname, options.config);
  const config = require(configPath);

  return config;
}

function main (inputCommand, options) {
  // getallorder
  if (inputCommand === 'getallorder') {
    const config = _checkConfig(options);
    require('./bin/get_all_order')(config);
  }

  // getaccount
  if (inputCommand === 'getaccount') {
    const config = _checkConfig(options);
    require('./bin/get_account')(config);
  }

  // version
  if (inputCommand === 'version') {
    const packageInfo = require('./package.json');
    console.log(`包名: ${packageInfo.name}\n版本: ${packageInfo.version}\n作者: ${packageInfo.author}\nhomepage: ${packageInfo.homepage}`);
  }
}

const cli = meow(`
	Usage
	  $ bwc <input> <option>

  Input
    getallorder   获取账户全部交易记录，计算各币对成本价
    getaccount    获取账户信息
    version       获取版本
    
	Options
	  --config, -c  指定配置文件

	Examples
	  $ bwc unicorns --config ./config.json
`, {
	flags: {
		config: {
			type: 'string',
			alias: 'c'
		}
	}
});
/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

main(cli.input[0], cli.flags);