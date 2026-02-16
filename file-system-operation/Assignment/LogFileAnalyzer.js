const fs = require("fs");

//crete read stream to read log file
const readStream = fs.createReadStream("app.log",{ encoding:"utf8"});

let totalLines=0;
let errorCount=0;

//When data is read in chunks
readStream.on("data",(chunk) => {
    const Lines = chunk.split("\n");

    Lines.forEach((line) =>{
        if(line.trim() !== ''){
            totalLines++;

            if(line.includes("Error")){
                errorCount++;
            }
        }
    });
});
// When file reading is finished
readStream.on('end', () => {
  console.log('Log File Analysis Report');
  console.log('------------------------');
  console.log('Total log entries:', totalLines);
  console.log('Total ERROR entries:', errorCount);
});

// Handle error
readStream.on('error', (err) => {
  console.error('Error reading log file:', err.message);
});