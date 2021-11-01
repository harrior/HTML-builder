const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'text.txt');
const readStream = fs.createReadStream(inputFile);

readStream.pipe(process.stdout);