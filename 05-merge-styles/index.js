const fs = require('fs');
const path = require('path');

const stylesDir = path.join(__dirname, 'styles');
console.log(stylesDir);

fs.promises.readdir(stylesDir, {withFileTypes: true})
  .then(files => {
    let bundleFile = fs.createWriteStream(path.join(__dirname, 'project-dist', 'bundle.css'));
    for (let file of files){
      if (file.isFile() && (path.extname(file.name) === '.css')){
        let srcCSS = fs.createReadStream(path.join(stylesDir, file.name));
        srcCSS.pipe(bundleFile);
      }
    }
  });
