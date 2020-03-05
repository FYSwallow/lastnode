// 商家分类的控制函数
const ShopCategoryModel = require('../../models/category/index')

const shopCategory = async (req, res) => {
    try {
        const entries = await ShopCategoryModel.find({}, '-_id');
        res.send( entries);
    } catch (err) {
        console.log(err);
        res.send({
            status: 0,
            type: 'ERROR_DATA',
            message: '获取数据失败'
        })
        return
    }
}

module.exports = {
    shopCategory,
}