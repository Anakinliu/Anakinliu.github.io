const fs = require("fs");
const path = require("path");
folderPath = '_posts'
const isFile = fileName => {
    return fs.lstatSync(fileName).isFile()
}

let res = fs.readdirSync(folderPath).map(fileName => {
    return path.join(folderPath, fileName)
}).filter(isFile)

console.log(res);