const fs = require("fs");
const path = require("path");
folderPath = '_posts'
const isFile = fileName => {
    return fs.lstatSync(fileName).isFile()
}

let files = fs.readdirSync(folderPath).map(fileName => {
    return path.join(folderPath, fileName)
}).filter(isFile)

console.log(files);


let re = /https:\/\/kouder\.cn/gm;
for (const filePath of files) {
    let data;

    let p = new Promise((resolve, reject) => {
        fs.readFile(filePath, function (err, buf) {
            if (err) {
                reject(err);
                return;
            }
            data = buf.toString().replace(re, "/images");
            resolve(data);
        });
    })
    p.then(data => {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, data, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(` 文件 ${filePath} 成功覆写 `);
            });
        })
    }).then(value => {
        console.log(value);
    }).catch(err => {
        console.log("出错了!");
        console.log(err);
    })
}



