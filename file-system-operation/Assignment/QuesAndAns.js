const fs = require("fs");
//Create and Write to a File
fs.writeFileSync("./explain.txt", "ANS:- 1 Synchronous operations block execution until the file task finishes,\n while asynchronous operations run in the background and let the program continue. Async improves performance and responsiveness, especially for I/O-heavy apps.\n");
fs.appendFileSync("./explain.txt", '\n ANS:-2 Use streams when working with large files or continuous data. They process data in chunks, reducing memory usage and improving efficiency\n');
fs.appendFileSync("./explain.txt","\n ANS:-3 Purpose of utf8 encodingIt tells the system to read/write the file as human-readable text instead of raw binary data.\n");
fs.appendFileSync("./explain.txt","\n ANS:-4 Common file system error codes\nENOENT: File or directory not found\nEACCES: Permission denied\nEEXIST: File or directory already exists\nEPERM: Operation not permitted\nENOTDIR: Expected a directory but found a file\n")
fs.appendFileSync("./explain.txt","\n ANS:-5 Safely delete a directory with contents Use a recursive delete method (e.g., fs.rm(dir, { recursive: true, force: true })).\n")
fs.appendFileSync("./explain.txt","\n ANS:- 6 Piping in streams Piping passes data from one stream to another automatically.Example: readStream.pipe(writeStream) copies a file.\n")
fs.appendFileSync("./explain.txt","\n ANS:- 7 To prevent crashes, data loss, and unexpected behavior.\n")
fs.appendFileSync("./explain.txt","\n ANS:- 8 writeFile overwrites the file; appendFile adds data to the end.\n")