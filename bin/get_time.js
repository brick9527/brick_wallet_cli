require('dotenv').config({ debug: false });
require('../src/libs/init_process')(process, 'gettime');

const getTime = require('../src/controller/get_time/index');

function runGetTime() {
  getTime();
}

if (require.main === module) {
  runGetTime();
}

module.exports = runGetTime;
