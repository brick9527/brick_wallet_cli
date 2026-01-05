const path = require('path');

function getTargetPath(filePath) {
  let targetPath = path.resolve(process.cwd(), filePath);
  if (path.isAbsolute(filePath)) {
    targetPath = filePath;
  }
  return targetPath;
}

module.exports = getTargetPath;