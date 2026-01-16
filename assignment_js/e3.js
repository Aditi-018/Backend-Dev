const os = require('os');
const fs = require('fs');

setInterval(() => {
  const systemInfo = `
Time: ${new Date().toISOString()}
Platform: ${os.platform()}
CPU: ${os.cpus()[0].model}
Memory: ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB
Free Memory: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB
-----------------------------
`;

  fs.appendFile('system.log', systemInfo, (err) => {
    if (err) console.error(err);
    else console.log('System info logged');
  });
}, 5000);
