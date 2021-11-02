const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'files');
const dstPath = path.join(__dirname, 'files-copy');

fs.promises.rm(dstPath, {force: true, recursive: true}).then(() => {
  backupDir('');
});

function backupDir(relPath) {
  const fullSrcPath = path.join(srcPath, relPath);
  const fullDstPath = path.join(dstPath, relPath);
  fs.promises.mkdir(fullDstPath).then(() => {
    fs.promises.readdir(fullSrcPath, {withFileTypes: true}).then(fileList => {
      for (let file of fileList) {
        if (file.isFile()) {
          const srcFilePath = path.join(fullSrcPath, file.name);
          const dstFilePath = path.join(fullDstPath, file.name);
          fs.promises.copyFile(srcFilePath, dstFilePath).catch(err => console.log(err));
        } else if (file.isDirectory()) {
          backupDir(path.join(relPath, file.name));
        }
      }
    });
  });
}