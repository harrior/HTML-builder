const fs = require('fs');
const path = require('path');

const stylesDir = path.join(__dirname, 'styles');
const bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');

fs.promises.readdir(stylesDir, {withFileTypes: true})
  .then(files => files
    .filter(file => file.isFile() && (path.extname(file.name) === '.css'))
    .map(file => path.join(stylesDir, file.name)))
  .then(files => Promise.all(files.map(filename => readStyles(filename))))
  .then(results => results.flat().join('\n'))
  .then(styles => {
    const ws = fs.createWriteStream(bundlePath);
    ws.write(styles);
  });

function readStyles(filename) {
  return new Promise(resolver => {
    const rs = fs.createReadStream(filename);
    const styles = [];
    rs.on('data', data => styles.push(data.toString()));
    return rs.on('end', () => resolver(styles));
  });
}