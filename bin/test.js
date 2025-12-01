require('dotenv').config();
require('../src/libs/init_process')(process, 'getallorder');

const test = require('../src/controller/get_order/test');

function main() {
  test();
}

main();
