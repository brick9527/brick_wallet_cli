require('dotenv').config({ debug: false });
require('../src/libs/init_process')(process, 'getaccount');

const getAccount = require('../src/controller/get_account/index');

function runGetAccount() {
  getAccount();
}

if (require.main === module) {
  runGetAccount();
}

module.exports = runGetAccount;
