const fs = require('fs');
const path = require('path');

const projectDist = path.join(__dirname, 'project-dist');

main();

async function main() {
  await createEnv();
  await copyAssets();
  await mergeStyles();
  await fillTemplate();
}

async function createEnv() {
  return fs.promises.rm(projectDist, {recursive: true, force: true})
    .then(() => fs.promises.mkdir(projectDist));
}

async function copyAssets() {
  const projectAssets = path.join(projectDist, 'assets');
  const srcAssets = path.join(__dirname, 'assets');

  copyDir('', srcAssets, projectAssets);

  function copyDir(relPath, srcPath, dstPath) {
    const fullSrcPath = path.join(srcPath, relPath);
    const fullDstPath = path.join(dstPath, relPath);
    fs.promises.mkdir(fullDstPath).then(() => {
      fs.promises.readdir(fullSrcPath, {withFileTypes: true})
        .then(fileList => {
          for (let file of fileList) {
            if (file.isFile()) {
              const srcFilePath = path.join(fullSrcPath, file.name);
              const dstFilePath = path.join(fullDstPath, file.name);
              fs.promises.copyFile(srcFilePath, dstFilePath).catch(err => console.log(err));
            } else if (file.isDirectory()) {
              copyDir(path.join(relPath, file.name), srcPath, dstPath);
            }
          }
        });
    });
  }
}

async function mergeStyles() {
  const stylesDir = path.join(__dirname, 'styles');
  const bundlePath = path.join(projectDist, 'style.css');

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
}

async function fillTemplate() {
  const templatePath = path.join(__dirname, 'template.html');
  const componentsPath = path.join(__dirname, 'components');

  const html = await loadTemplate(templatePath);
  const renderedHtml = await renderTemplate(html);
  await makeIndex(renderedHtml);

  async function loadTemplate(filename){
    return loadFile(filename);
  }

  async function loadComponent(name){
    name = name.trim();
    return loadFile(path.join(componentsPath,`${name}.html`));
  }

  async function loadFile(filename){
    return new Promise(resolver => {
      const rs = fs.createReadStream(filename);
      const content = [];
      rs.on('data', data => content.push(data.toString()));
      rs.on('end', () => {
        resolver(content.join(''));
      });
    });
  }

  async function renderTemplate(html){
    const result = [];
    html = html.split('\n');
    const pattern = /({{(?<component>[a-zA-Z -]+)}})/;
    for (let line of html){
      if (line.match(pattern)){
        const componentName = line.match(pattern).groups.component;
        const component = await loadComponent(componentName);
        result.push(line.replace(pattern, component));
      }
      else {
        result.push(line);
      }
    }
    return result.join('\n');
  }

  async function makeIndex(html){
    return new Promise(resolve => {
      const indexPath = path.join(projectDist,'index.html');
      const ws = fs.createWriteStream(indexPath);
      ws.write(html);
      ws.on('finish', () => resolve());
    });
  }
}