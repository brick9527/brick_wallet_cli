const dayjs = require('dayjs');

function formatMyTradeRes(rawContent) {
  const contentList = rawContent.map(raw => {
    return {
      ...raw,
      timeLocal: dayjs(rawContent?.time).format('YYYY-MM-DD HH:mm:ss'),
    };
  });
  
  return contentList;
}

module.exports = formatMyTradeRes;

