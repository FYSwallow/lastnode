const formidable = require('formidable'); //处理表单提交
const { Food, Menu } = require('../../models/shop/food');

const ShopModel = require('../../models/shop/index');
const CategoryModel = require('../../models/shop/category');
const DeliveryModel = require('../../models/shop/delivery');
const ActivityModel = require('../../models/shop/activity');
const { getId } = require('../ids/ids')
const { getDistance } = require('../../controls/cities/utils')
//添加商铺
const addShop = async (req, res, next) => {
    let restaurant_id;
    try {
        restaurant_id = await getId('restaurant_id');
    } catch (err) {
        console.log('获取商店id失败');
        res.send({
            type: 'ERROR_DATA',
            message: '获取数据失败'
        })
        return
    }
    console.log(req.body)
    try {
        if (!req.body.name) {
            throw new Error('必须填写商店名称');
        } else if (!req.body.address) {
            throw new Error('必须填写商店地址');
        } else if (!req.body.phone) {
            throw new Error('必须填写联系电话');
        } else if (!req.body.latitude || !req.body.longitude) {
            throw new Error('商店位置信息错误');
        } else if (!req.body.image_path) {
            throw new Error('必须上传商铺图片');
        } else if (!req.body.category) {
            throw new Error('必须上传食品种类');
        }
    } catch (err) {
        console.log('前台参数出错', err.message);
        res.send({
            status: 0,
            type: 'ERROR_PARAMS',
            message: err.message
        })
        return
    }
    const exists = await ShopModel.findOne({ name: req.body.name });
    if (exists) {
        res.send({
            status: 0,
            type: 'RESTURANT_EXISTS',
            message: '店铺已存在，请尝试其他店铺名称',
            data: exists
        })
        return
    }
    const opening_hours = req.body.startTime && req.body.endTime ? req.body.startTime + '/' + req.body.endTime : "8:30/20:30";
    const newShop = {
        name: req.body.name,
        address: req.body.address,
        description: req.body.description || '',
        float_delivery_fee: req.body.float_delivery_fee || 0,
        float_minimum_order_amount: req.body.float_minimum_order_amount || 0,
        id: restaurant_id,
        is_premium: req.body.is_premium || false,
        is_new: req.body.new || false,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        location: [req.body.longitude, req.body.latitude],
        opening_hours: [opening_hours],
        phone: req.body.phone,
        promotion_info: req.body.promotion_info || "欢迎光临，用餐高峰请提前下单，谢谢",
        rating: (4 + Math.random()).toFixed(1),
        rating_count: Math.ceil(Math.random() * 1000),
        recent_order_num: Math.ceil(Math.random() * 1000),
        status: Math.round(Math.random()),
        image_path: req.body.image_path,
        category: req.body.category,
        piecewise_agent_fee: {
            tips: "配送费约¥" + (req.body.float_delivery_fee || 0),
        },
        activities: [],
        supports: [],
        license: {
            business_license_image: req.body.business_license_image || '',
            catering_service_license_image: req.body.catering_service_license_image || '',
        },
        identification: {
            company_name: "",
            identificate_agency: "",
            identificate_date: "",
            legal_person: "",
            licenses_date: "",
            licenses_number: "",
            licenses_scope: "",
            operation_period: "",
            registered_address: "",
            registered_number: "",
        },
    }
    //配送方式
    if (req.body.delivery_mode) {
        Object.assign(newShop, {
            delivery_mode: {
                color: "57A9FF",
                id: 1,
                is_solid: true,
                text: "蜂鸟专送"
            }
        })
    }
    //商店支持的活动
    if (req.body.delivery_mode) {
        req.body.activities.forEach((item, index) => {
            switch (item.icon_name) {
                case '减':
                    item.icon_color = 'f07373';
                    item.id = index + 1;
                    break;
                case '特':
                    item.icon_color = 'EDC123';
                    item.id = index + 1;
                    break;
                case '新':
                    item.icon_color = '70bc46';
                    item.id = index + 1;
                    break;
                case '领':
                    item.icon_color = 'E3EE0D';
                    item.id = index + 1;
                    break;
            }
            newShop.activities.push(item);
        })
    }

    if (req.body.bao) {
        newShop.supports.push({
            description: "已加入“外卖保”计划，食品安全有保障",
            icon_color: "999999",
            icon_name: "保",
            id: 7,
            name: "外卖保"
        })
    }
    if (req.body.zhun) {
        newShop.supports.push({
            description: "准时必达，超时秒赔",
            icon_color: "57A9FF",
            icon_name: "准",
            id: 9,
            name: "准时达"
        })
    }
    if (req.body.piao) {
        newShop.supports.push({
            description: "该商家支持开发票，请在下单时填写好发票抬头",
            icon_color: "999999",
            icon_name: "票",
            id: 4,
            name: "开发票"
        })
    }
    try {
        //保存数据，并增加对应食品种类的数量
        const shop = new ShopModel(newShop);
        await shop.save();
        // CategoryHandle.addCategory(req.body.category)
        // Rating.initData(restaurant_id);
        // Food.initData(restaurant_id);
        res.send({
            status: 1,
            sussess: '添加餐馆成功',
            shopDetail: newShop
        })
    } catch (err) {
        res.send({
            status: 0,
            type: 'ERROR_SERVER',
            message: '添加商铺失败',
            err
        })
    }
}
// 获取餐馆信息
const getRestaurants = async (req, res) => {
    const {
        latitude,
        longitude,
        offset = 0,
        limit = 20,
        keyword,
        restaurant_category_id,
        order_by,
        extras,
        delivery_mode = [],
        support_ids = [],
        restaurant_category_ids = [],
    } = req.query;

    try {
        if (!latitude) {
            res.send({
                status: 0,
                message: 'latitude参数错误'
            })
        } else if (!longitude) {
            res.send({
                status: 0,
                message: 'longitude参数错误'
            })
        }
    } catch (err) {
        res.send({
            status: 0,
            message: err
        })
    }
    let filter;
    filter = Object.assign({}, { name: '231' })

    /*
        根据条件获取餐馆信息
    */

    //按照距离，评分，销量等排序
    let sortBy = {};
    if (Number(order_by)) {
        switch (Number(order_by)) {
            case 1:
                Object.assign(sortBy, { float_minimum_order_amount: 1 });
                break;
            case 2:
                Object.assign(filter, { location: { $near: [longitude, latitude] } });
                break;
            case 3:
                Object.assign(sortBy, { rating: -1 });
                break;
            case 5:
                Object.assign(filter, { location: { $near: [longitude, latitude] } });
                break;
            case 6:
                Object.assign(sortBy, { recent_order_num: -1 });
                break;
        }
    }
    //获取所有餐馆

    /*
        mongoose
        find（）   查询商品，
        limit(), 限制显示文档个数
        skip(); 跳过文档个数，
    */
    const restaurants = await ShopModel.find({}).sort(sortBy); //第二个参数表示只返回_id字段

    const from = latitude + ',' + longitude;
    let to = '';

    //获取百度地图测局所需经度纬度
    restaurants.forEach((item, index) => {
        const slpitStr = (index == restaurants.length - 1) ? '' : '|';
        to += item.latitude + ',' + item.longitude + slpitStr;
    })

    try {
        if (restaurants.length) {
            //获取距离信息，并合并到数据中
            const distance_duration = await getDistance(from, to)
            restaurants.map((item, index) => {
                return Object.assign(item, distance_duration[index])
            })
        }
    } catch (err) {
        // 百度地图达到上限后会导致加车失败，需优化
        console.log('从addressComoponent获取测距数据失败', err);
        restaurants.map((item, index) => {
            return Object.assign(item, { distance: '10公里', order_lead_time: '40分钟' })
        })
    }
    try {
        res.send({
            status: 1,
            data: restaurants
        })
    } catch (err) {
        res.send({
            status: 0,
            type: 'ERROR_GET_SHOP_LIST',
            message: '获取店铺列表数据失败'
        })
    }
}

//搜索餐馆
const searchRestaurants = async (req, res, next) => {
    console.log(123)
    const { geohash, keyword } = req.query;
    try {
        if (!geohash || geohash.indexOf(',') == -1) {
            throw new Error('经纬度参数错误');
        } else if (!keyword) {
            throw new Error('关键词参数错误');
        }
    } catch (err) {
        console.log('搜索商铺参数错误');
        res.send({
            status: 0,
            type: 'ERROR_PARAMS',
            message: err.message,
        })
        return
    }

    try {
        const restaurants = await ShopModel.find({ name: eval('/' + keyword + '/gi') }, '-_id').limit(50);
        console.log(restaurants)
        if (restaurants.length) {
            const [latitude, longitude] = geohash.split(',');
            const from = latitude + ',' + longitude;
            let to = '';
            //获取百度地图测局所需经度纬度
            restaurants.forEach((item, index) => {
                const slpitStr = (index == restaurants.length - 1) ? '' : '|';
                to += item.latitude + ',' + item.longitude + slpitStr;
            })
            //获取距离信息，并合并到数据中
            const distance_duration = await getDistance(from, to)
            restaurants.map((item, index) => {
                return Object.assign(item, distance_duration[index])
            })
        }
        res.send(restaurants);
    } catch (err) {
        console.log('搜索餐馆数据失败');
        res.send({
            status: 0,
            type: 'ERROR_DATA',
            message: '搜索餐馆数据失败'
        })
    }
}

//获取餐馆详情
const getRestaurantDetail = async (req, res, next) => {
    const restaurant_id = req.query.restaurant_id;
    if (!restaurant_id || !Number(restaurant_id)) {
        console.log('获取餐馆详情参数ID错误');
        res.send({
            status: 0,
            type: 'ERROR_PARAMS',
            message: '餐馆ID参数错误',
        })
        return
    }
    try {
        const restaurant = await ShopModel.findOne({ id: restaurant_id }, '-_id');
        res.send(restaurant)
    } catch (err) {
        console.log('获取餐馆详情失败', err);
        res.send({
            status: 0,
            type: 'GET_DATA_ERROR',
            message: '获取餐馆详情失败'
        })
    }
}

//获取所有餐馆分类和数量
const getCategories = async (req, res, next) => {
    try {
        const categories = await CategoryModel.find({}, '-_id');
        res.send(categories);
    } catch (err) {
        console.log('获取categories失败');
        res.send({
            status: 0,
            type: 'ERROR_DATA',
            message: '获取categories失败',
            err: err.message
        })
    }
}

//获取配送方式
const getDelivery = async (req, res, next) => {
    try {
        const deliveries = await DeliveryModel.find({}, '-_id');
        res.send(deliveries)
    } catch (err) {
        console.log('获取配送方式数据失败');
        res.send({
            status: 0,
            type: 'ERROR_DATA',
            message: '获取配送方式数据失败'
        })
    }
}

//获取活动列表
const getActivity = async (req, res, next) => {
    try {
        const activities = await ActivityModel.find({}, '-_id');
        res.send(activities)
    } catch (err) {
        console.log('获取活动数据失败');
        res.send({
            status: 0,
            type: 'ERROR_DATA',
            message: '获取活动数据失败'
        })
    }
}

//添加商家食品种类
const addCategory = async (req, res, next) => {
    const { name, description, restaurant_id } = req.body
    try {
        if (!name) {
            throw new Error('必须填写食品类型名称');
        } else if (!restaurant_id) {
            throw new Error('餐馆ID错误');
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

    let category_id;
    try {
        category_id = await getId('category_id');
        console.log(category_id + 'category_id')
    } catch (err) {
        console.log('获取category_id失败');
        res.send({
            type: 'ERROR_DATA',
            message: '获取数据失败'
        })
        return
    }

    const foodObj = {
        name,
        description,
        restaurant_id,
        id: category_id,
        foods: [],
    }
    const newFood = new Menu(foodObj);
    try {
        await newFood.save();
        res.send({
            status: 1,
            success: '添加食品种类成功',
        })
    } catch (err) {
        console.log('保存数据失败');
        res.send({
            status: 0,
            type: 'ERROR_IN_SAVE_DATA',
            message: '保存数据失败',
        })
    }

}

//添加食品

const addFood = async (req, res, next) => {
    const { name, image_path, specs, category_id, restaurant_id } = req.body
    try {
        if (!name) {
            throw new Error('必须填写食品名称');
        } else if (!image_path) {
            throw new Error('必须上传食品图片');
        } else if (!specs.length) {
            throw new Error('至少填写一种规格');
        } else if (!category_id) {
            throw new Error('食品类型ID错误');
        } else if (!restaurant_id) {
            throw new Error('餐馆ID错误');
        }
    } catch (err) {
        console.log('前台参数错误', err.message);
        res.send({
            status: 0,
            type: 'ERROR_PARAMS',
            message: err.message
        })
        return
    }
    let category;
    let restaurant;
    try {
        category = await Menu.findOne({ id: category_id });
        restaurant = await ShopModel.findOne({ id: restaurant_id });
    } catch (err) {
        console.log('获取食品类型和餐馆信息失败');
        res.send({
            status: 0,
            type: 'ERROR_DATA',
            message: '添加食品失败'
        })
        return
    }
    let item_id;
    try {
        item_id = await getId('item_id');
    } catch (err) {
        console.log('获取item_id失败');
        res.send({
            status: 0,
            type: 'ERROR_DATA',
            message: err.message
        })
        return
    }
    const rating_count = Math.ceil(Math.random() * 1000);
    const month_sales = Math.ceil(Math.random() * 1000);
    const tips = rating_count + "评价 月售" + month_sales + "份";
    const newFood = {
        name: name,
        description: req.body.description,
        image_path: image_path,
        activity: null,
        attributes: [],
        restaurant_id: restaurant_id,
        category_id: category_id,
        satisfy_rate: Math.ceil(Math.random() * 100),
        satisfy_count: Math.ceil(Math.random() * 1000),
        item_id,
        rating: (4 + Math.random()).toFixed(1),
        rating_count,
        month_sales,
        tips,
        specfoods: [],
        specifications: [],
    }
    if (req.body.activity) {
        newFood.activity = {
            image_text_color: 'f1884f',
            icon_color: 'f07373',
            image_text: activity,
        }
    }
    if (req.body.attributes) {
        req.body.attributes.forEach(item => {
            let attr;
            switch (item) {
                case '新':
                    attr = {
                        icon_color: '5ec452',
                        icon_name: '新'
                    }
                    break;
                case '招牌':
                    attr = {
                        icon_color: 'f07373',
                        icon_name: '招牌'
                    }
                    break;
            }
            newFood.attributes.push(attr);
        })
    }
    try {
        const [specfoods, specifications] = await getSpecfoods(req.body, item_id);
        newFood.specfoods = specfoods;
        newFood.specifications = specifications;
    } catch (err) {
        console.log('添加specs失败', err);
        res.send({
            status: 0,
            type: 'ERROR_DATA',
            message: err.message
        })
        return
    }
    try {
        const foodEntity = await Food.create(newFood);
        category.foods.push(foodEntity);
        category.markModified('foods');
        await category.save();
        res.send({
            status: 1,
            success: '添加食品成功',
        });
    } catch (err) {
        console.log('保存食品到数据库失败', err);
        res.send({
            status: 0,
            type: 'ERROR_DATA',
            message: err.message
        })
    }
    // })
}

// 获取食品列表
const getFoodsList = async (req, res, next) => {
    const { restaurant_id } = req.query
    if (!restaurant_id || !Number(restaurant_id)) {
        console.log('获取餐馆参数ID错误');
        res.send({
            status: 0,
            type: 'ERROR_PARAMS',
            message: '餐馆ID参数错误',
        })
        return
    }
    try {
        const menu = await Menu.findOne({restaurant_id});
        res.send(menu);
    } catch (err) {
        console.log('获取食品数据失败', err);
        res.send({
            status: 0,
            type: 'GET_DATA_ERROR',
            message: err.message
        })
    }
}

// 获取食品规格
const getSpecfoods = async (fields, item_id) => {
    let specfoods = [], specifications = [];
    if (fields.specs.length < 2) {
        let food_id, sku_id;
        try {
            sku_id = await getId('sku_id');
            food_id = await getId('food_id');
        } catch (err) {
            throw new Error('获取sku_id、food_id失败')
        }
        specfoods.push({
            packing_fee: fields.specs[0].packing_fee,
            price: fields.specs[0].price,
            specs: [],
            specs_name: fields.specs[0].specs,
            name: fields.name,
            item_id,
            sku_id,
            food_id,
            restaurant_id: fields.restaurant_id,
            recent_rating: (Math.random() * 5).toFixed(1),
            recent_popularity: Math.ceil(Math.random() * 1000),
        })
    } else {
        specifications.push({
            values: [],
            name: "规格"
        })
        for (let i = 0; i < fields.specs.length; i++) {
            let food_id, sku_id;
            try {
                sku_id = await getId('sku_id');
                food_id = await getId('food_id');
            } catch (err) {
                throw new Error('获取sku_id、food_id失败')
            }
            specfoods.push({
                packing_fee: fields.specs[i].packing_fee,
                price: fields.specs[i].price,
                specs: [{
                    name: "规格",
                    value: fields.specs[i].specs
                }],
                specs_name: fields.specs[i].specs,
                name: fields.name,
                item_id,
                sku_id,
                food_id,
                restaurant_id: fields.restaurant_id,
                recent_rating: (Math.random() * 5).toFixed(1),
                recent_popularity: Math.ceil(Math.random() * 1000),
            })
            specifications[0].values.push(fields.specs[i].specs);
        }
    }
    return [specfoods, specifications]
}
module.exports = {
    addShop,
    getRestaurants,
    searchRestaurants,
    getCategories,
    addCategory,
    getDelivery,
    getActivity,
    getRestaurantDetail,
    addFood,
    getFoodsList
}