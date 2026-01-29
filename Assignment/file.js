const fs = require('fs');

const sourceDir = './source';
const destDir = './destination';

fs.readdir(sourceDir, (err, sourceFiles) => {
  if (err) {
    console.error('Error reading source directory');
    return;
  }

  fs.readdir(destDir, (err, destFiles) => {
    if (err) {
      console.error('Error reading destination directory');
      return;
    }

    sourceFiles.forEach((file) => {
      if (!destFiles.includes(file)) {
        fs.copyFile(`${sourceDir}/${file}`, `${destDir}/${file}`, (err) => {
          if (err) {
            console.error('Error copying file:', file);
          } else {
            console.log('File synchronized:', file);
          }
        });
      }
    });
  });
});
