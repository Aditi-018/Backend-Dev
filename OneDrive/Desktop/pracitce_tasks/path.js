


// const path=require("path");
// const filePath="/user/admin/docs/report.pdf";
// console.log(path.basename(filePath)); // Output: report.pdf

const path=require("path");
console.log("File Name:",path.basename(__filename));
console.log("Folder Name:",path.dirname(__filename));
console.log("Extension:",path.extname(__filename));

const fullpath=path.join(__dirname, "public","index.html");
console.log("Full Path:",fullpath);