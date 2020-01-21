// 食品路由的控制函数
const FoodsModel = require('../../models/foods/index')

const foodCategory = async (req, res) => {
    try{
        const entries = await FoodsModel.find({}, '-_id');
        res.send(entries);
    }catch(err){
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
    foodCategory,
    
}