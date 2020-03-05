const Md5 = require('md5')
const fs = require('fs')
const path = require('path')
const gm = require('gm')
const formidable = require('formidable')
const { getId } = require('../controls/ids/ids')

//定义一个加密函数
const encryption = (password) => {
    const newpassword = Md5(Md5(password).substr(2, 7) + Md5(password));
    return newpassword
}

exports.encryption = encryption

// 上传图片并获取图片地址
const getPath = async (req) => {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm();   //创建上传表单
        form.encoding = 'utf-8';        //设置编辑
        form.uploadDir = "./public/img"     //设置上传目录
        form.keepExtensions = true;     //保留后缀
        form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
        form.parse(req, async (err, fields, files) => {
            let img_id;
            try {
                img_id = await getId('img_id');
            } catch (err) {
                fs.unlinkSync(files.file.path);
                reject('获取图片id失败');
            }
            const hashName = (new Date().getTime() + Math.ceil(Math.random() * 10000)).toString(16) + img_id;
            const extname = path.extname(files.file.name);
            console.log(extname)
            if (!['.jpg', '.jpeg', '.png'].includes(extname)) {
                fs.unlinkSync(files.file.path);
                reject('文件格式错误');
                return
            }

            const fullName = hashName + extname;
            const repath = './public/img/' + fullName;

            try {
                fs.renameSync(files.file.path, repath)
                gm(repath)
                    .resize(200, 200, "!")
                    .write(repath, async (err) => {
                        resolve(fullName)
                    })
            } catch (err) {
                if (fs.existsSync(repath)) { //存在该文件,就删除该文件
                    fs.unlinkSync(repath);
                } else {
                    fs.unlinkSynac(files.file.path);
                }
                reject(err.message)
            }

        })
    })

}

exports.getPath = getPath
