const { getPath } = require('../../utils/util')

const uploadImg = async (req, res) => {
    try {
        const image_path = await getPath(req);
        res.send(image_path)
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