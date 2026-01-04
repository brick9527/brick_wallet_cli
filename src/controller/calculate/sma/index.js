const { SMA } = require('trading-signals');

async function getSMA(data, length) {
  const smaEntry = new SMA(length);
  for (const dataItem of data) {
    smaEntry.update(dataItem);
  }

  if (!smaEntry.isStable) {
    return null;
  }

  const result = smaEntry.getResult();

  if (Number.isNaN(result)) {
    return result;
  }

  return Number(result).toFixed(8);
}

module.exports = getSMA;
