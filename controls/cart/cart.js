
const PaymentsModel = require('../../models/order/payments')
const ShopModel = require('../../models/shop/index')
const CartModel = require('../../models/order/cart')
const OrderModel = require('../../models/order/order')
const { getId } = require('../ids/ids')
const { getDistance } = require('../cities/utils')
const {formateDate} = require('../../utils/dateUtils')

// 加入购物车
const checkout = async (req, res) => {
    console.log(req.cookies.user_id)
    const user_id = req.cookies.user_id
    const extra = [{
        description: '',
        name: '餐盒',
        price: 0,
        quantity: 1,
        type: 0,
    }]
    const { come_from, geohash, entities = [], restaurant_id } = req.body;
    try {
        if (!(entities instanceof Array) || !entities.length) {
            throw new Error('entities参数错误')
        } else if (!(entities[0] instanceof Array) || !entities[0].length) {
            throw new Error('entities参数错误')
        } else if (!restaurant_id) {
            throw new Error('restaurant_id参数错误')
        }
    } catch (err) {
        console.log(err);
        res.send({
            status: 0,
            type: 'ERROR_PARAMS',
            message: err.message
        })
        return
    }
    let payments; //付款方式
    let cart_id; //购物车id
    let restaurant; //餐馆详情
    let deliver_time; //配送时间
    let delivery_reach_time; //到达时间
    let from = geohash.split(',')[0] + ',' + geohash.split(',')[1];
    try {
        payments = await PaymentsModel.find({}, '-_id');
        cart_id = await getId('cart_id');
        restaurant = await ShopModel.findOne({ id: restaurant_id });
        const to = restaurant.latitude + ',' + restaurant.longitude;
        deliver_time = await getDistance(from, to, 'tiemvalue');
        let time = new Date().getTime() + deliver_time * 1000;
        let hour = ('0' + new Date(time).getHours()).substr(-2);
        let minute = ('0' + new Date(time).getMinutes()).substr(-2);
        delivery_reach_time = hour + ':' + minute;
    } catch (err) {
        console.log('获取数据数据失败', err);
        res.send({
            status: 0,
            type: 'ERROR_DATA',
            message: '添加购物车失败',
        })
        return
    }
    const deliver_amount = 4;
    let price = 0; //食品价格
    entities[0].map(item => {
        price += item.price * item.quantity;
        if (item.packing_fee) {
            extra[0].price += item.packing_fee * item.quantity;
        }
        if (item.specs[0]) {
            return item.name = item.name + '-' + item.specs[0];
        }
    })
    //食品总价格
    const total = price + extra[0].price * extra[0].quantity + deliver_amount;
    //是否支持发票
    let invoice = {
        is_available: false,
        status_text: "商家不支持开发票",
    };
    restaurant.supports.forEach(item => {
        if (item.icon_name == '票') {
            invoice = {
                is_available: true,
                status_text: "不需要开发票",
            };
        }
    })
    const checkoutInfo = {
        id: cart_id,
        cart: {
            id: cart_id,
            groups: entities,
            extra,
            deliver_amount,
            is_deliver_by_fengniao: !!restaurant.delivery_mode,
            original_total: total,
            phone: restaurant.phone,
            restaurant_id,
            restaurant_info: restaurant,
            restaurant_minimum_order_amount: restaurant.float_minimum_order_amount,
            total,
            user_id,
        },
        delivery_reach_time,
        invoice,
        sig: Math.ceil(Math.random() * 1000000).toString(),
        payments,
    }
    try {
        const newCart = new CartModel(checkoutInfo);
        const cart = await newCart.save();
        res.send(cart)
    } catch (err) {
        console.log('保存购物车数据失败');
        res.send({
            status: 0,
            type: 'ERROR_TO_SAVE_CART',
            message: '加入购物车失败'
        })
    }
}

// 提交订单
const postOrder = async (req, res) => {
    const { user_id, cart_id } = req.params;
    const { address_id, come_from = 'mobile_web', deliver_time = '', description, entities, geohash, paymethod_id = 1 } = req.body;
    try {
        if (!(entities instanceof Array) || !entities.length) {
            throw new Error('entities参数错误')
        } else if (!(entities[0] instanceof Array) || !entities[0].length) {
            throw new Error('entities参数错误')
        } else if (!address_id) {
            throw new Error('address_id参数错误')
        } else if (!user_id || !Number(user_id)) {
            throw new Error('user_id参数错误')
        } else if (!cart_id || !Number(cart_id)) {
            throw new Error('cart_id参数错误')
        } else if (!user_id) {
            throw new Error('未登录')
        }
    } catch (err) {
        console.log(err.message, err);
        res.send({
            status: 0,
            type: 'ERROR_PARAMS',
            message: err.message
        })
        return
    }
    let cartDetail;
    let order_id;
    try {
        cartDetail = await CartModel.findOne({ id: cart_id });
        order_id = await getId('order_id');
    } catch (err) {
        console.log('获取数据失败', err);
        res.send({
            status: 0,
            type: 'ERROR_GET_DATA',
            message: '获取订单失败',
        })
        return
    }
    const deliver_fee = { price: cartDetail.cart.deliver_amount };
    const orderObj = {
        basket: {
            group: entities,
            packing_fee: {
                name: cartDetail.cart.extra[0].name,
                price: cartDetail.cart.extra[0].price,
                quantity: cartDetail.cart.extra[0].quantity,
            },
            deliver_fee,
        },
        restaurant_id: cartDetail.cart.restaurant_id,
        restaurant_image_url: cartDetail.cart.restaurant_info.image_path,
        restaurant_name: cartDetail.cart.restaurant_info.name,
        formatted_created_at: formateDate(Date.now()),
        order_time: new Date().getTime(),
        time_pass: 900,
        status_bar: {
            color: 'f60',
            image_type: '',
            sub_title: '15分钟内支付',
            title: '',
        },
        total_amount: cartDetail.cart.total,
        total_quantity: entities[0].length,
        unique_id: order_id,
        id: order_id,
        user_id,
        address_id,
    }
    try {
        await OrderModel.create(orderObj);
        res.send({
            status: 1,
            success: '下单成功，请及时付款',
            need_validation: false,
        })
    } catch (err) {
        console.log('保存订单数据失败',err);
        res.send({
            status: 0,
            type: 'ERROR_SAVE_ORDER',
            message: '保存订单失败'
        })
    }

}

// 获取当前用户订单
const getOrders = async(req, res, next) =>{
    const user_id = req.params.user_id;
    const {limit = 0, offset = 0} = req.query;
    try{
        if(!user_id || !Number(user_id)){
            throw new Error('user_id参数错误')
        }else if(!Number(limit)){
            throw new Error('limit参数错误')
        }else if(typeof Number(offset) !== 'number'){
            throw new Error('offset参数错误')
        }
    }catch(err){
        console.log(err.message, err);
        res.send({
            status: 0,
            type: 'ERROR_PARAMS',
            message: err.message
        })
        return 
    }
    try{
        const orders = await OrderModel.find({user_id}).sort({id: -1}).limit(Number(limit)).skip(Number(offset));
        const timeNow = new Date().getTime();
        orders.map(item => {
            if (timeNow - item.order_time < 900000) {
                item.status_bar.title = '等待支付';
            }else{
                item.status_bar.title = '支付超时';
            }
            item.time_pass = Math.ceil((timeNow - item.order_time)/1000);
            item.save()
            return item
        })
        res.send(orders);
    }catch(err){
        console.log('获取订单列表失败', err);
        res.send({
            status: 0,
            type: 'ERROR_GET_ORDER_LIST',
            message: '获取订单列表失败'
        })
    }
    
}

const getAllOrders = async(req, res, next) =>{
    const {restaurant_id, limit = 20, offset = 0} = req.query;
    try{
        let filter = {};
        if (restaurant_id && Number(restaurant_id)) {
            filter = {restaurant_id}
        }

        const orders = await OrderModel.find(filter).sort({id: -1}).limit(Number(limit)).skip(Number(offset));
        const timeNow = new Date().getTime();
        orders.map(item => {
            if (timeNow - item.order_time < 900000) {
                item.status_bar.title = '等待支付';
            }else{
                item.status_bar.title = '支付超时';
            }
            item.time_pass = Math.ceil((timeNow - item.order_time)/1000);
            item.save()
            return item
        })
        res.send(orders);
    }catch(err){
        console.log('获取订单数据失败', err);
        res.send({
            status: 0,
            type: 'GET_ORDER_DATA_ERROR',
            message: '获取订单数据失败'
        })
    }
}
module.exports = {
    checkout,
    postOrder,
    getOrders,
    getAllOrders
}