function loadConfig (filePath) {
  const config = require(filePath);
  return config;
}

module.exports = loadConfig;