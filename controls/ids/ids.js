const idList = ['restaurant_id', 'food_id', 'order_id', 'user_id', 'address_id', 'cart_id', 'img_id', 'category_id', 'item_id', 'sku_id', 'admin_id', 'statis_id'];
const IdsMoudle = require('../../models/ids/ids');
const getId = async type => {
    if (!idList.includes(type)) {
        throw new Error('id类型错误');
        return
    }
    try {
        const idData = await IdsMoudle.findOne();
        idData[type]++;
        await idData.save();
        return idData[type];
    } catch (error) {
        throw new Error(err);
    }
}

module.exports = {
    getId
}