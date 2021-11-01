const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, 'output.txt');
const writeStream = fs.createWriteStream(outputFile);

process.stdout.write('Hello! Tell me something interesting!\n');

process.stdin.on('data', data => {
  if (data.toString().trim() === 'exit'){
    exit();
  }
  writeStream.write(data);
});

process.on('SIGINT', () => {
  exit();
});

function exit() {
  process.stdout.write('Have a nice day! Bye!');
  writeStream.close();
  process.exit(0);
}
