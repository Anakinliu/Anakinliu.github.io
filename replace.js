const fs = require("fs");
let re = /https:\/\/kouder\.cn/gm;
const path = "_posts/zui-xiao-de-k-ge-shu.md"
let data;

let p = new Promise((resolve, reject) => {
    fs.readFile(path, function (err, buf) {
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
        fs.writeFile(path, data, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(` 文件 ${path} 成功覆写 `);
        });
    })
}).then(value => {
    console.log(value);
}).catch(err => {
    console.log("出错了!");
    console.log(err);
})


