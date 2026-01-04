const _ = require('lodash');

function _getGridPrice({ type = 'off', price, percent }) {
  if (type === 'off') {
    return price * (1 - percent/100);
  }

  return price * (1 + percent/100);
}

function generateGridPriceList(price) {
  const GRID_PERCENT = [5, 10, 15, 20, 25, 30];
  const GRID_TYPE = ['off', 'up'];

  const gridPriceObj = {
    off: {},
    up: {},
  }
  for (const type of GRID_TYPE) {
    for (const percent of GRID_PERCENT) {
      const targetPrice = _getGridPrice({
        type, 
        percent,
        price,
      });

      _.set(gridPriceObj, `${type}._${percent}_${type}`, targetPrice.toFixed(8));
    }
  }

  return gridPriceObj;
}

module.exports = generateGridPriceList;