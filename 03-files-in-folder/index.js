const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'secret-folder');


fs.promises.readdir(dir, {withFileTypes: true}).then(
  files => {
    for (let file of files) {
      if (file.isFile()) {
        printFileInfo(file.name);
      }
    }
  });

function printFileInfo(file) {
  let filePath = path.join(dir, file);
  let filename = path.basename(file, path.extname(file));
  let extension = path.extname(file).slice(1);

  fs.stat(filePath, (error, data) => {
    const size = Math.ceil(data['size'] / 1024);
    console.log(`${filename} - ${extension} - ${size}kb`);
  });
}
