require('dotenv').config();
require('../src/libs/init_process')(process, 'getaccount');

const getAccount = require('../src/controller/get_account/index');

function main() {
  getAccount();
}

main();
