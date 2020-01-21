const { upPic } = require('../../utils/upload-files')

const uploadImg = async (req, res) => {
    const type = req.params.type;
    console.log(type)
    try {
        const image_path = await upPic(req);
        res.send({
            status: 1,
            image_path,
        })
    } catch (err) {
        console.log('上传图片失败', err);
        res.send({
            status: 0,
            type: 'ERROR_UPLOAD_IMG',
            message: err.message
        })
    }
}

module.exports = {
    uploadImg
} 