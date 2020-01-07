const ShopModel = require('../../models/shop/index');

// 添加商铺
const addShop = async (req, res) => {
    try {
        if (!req.body.name) {
            res.send({ status: 1, message: "必须填写商店名称" });
        } else if (!req.body.address) {
            res.send({ status: 1, message: "必须填写商店地址" });
        } else if (!req.body.phone) {
            res.send({ status: 1, message: "必须填写联系电话" });
        } else if (!req.body.latitude || !req.body.longitude) {
            res.send({ status: 1, message: "商店位置信息错误" });
        } else if (!req.body.image_path) {
            res.send({ status: 1, message: "必须上传商铺图片" });
        } else if (!req.body.category) {
            res.send({ status: 1, message: "必须上传食品种类" });
        } else if (!req.body.float_delivery_free) {
            res.send({ status: 1, message: "必须填写运费" });
        } else if (!req.body.float_minimum_order_amount) {
            res.send({ status: 1, message: "必须填写起送价" });
        }
    } catch (error) {
        res.send({ status: 1, message: error });
    }
    // 查询数据库中是否已经存在该店铺
    const exists = await ShopModel.findOne({ name: req.body.name });
    if (exists) {
        res.send({
            status: 1,
            type: 'RESTURANT_EXISTS',
            message: '店铺已存在，请尝试其他店铺名称',
        })
        return
    }

    // 设置店铺的营业时间
    const opening_hours = req.body.startTime && req.body.endTime ? req.body.startTime + '/' + req.body.endTime : "8:30/20:30";
    const newShop = {
        name: req.body.name,
        address: req.body.address,
        description: req.body.description || '',
        float_delivery_fee: req.body.float_delivery_fee || 0,
        float_minimum_order_amount: req.body.float_minimum_order_amount || 0,
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
        id: 0
    }

    //配送方式
    // if (req.body.delivery_mode) {
    //     Object.assign(newShop, {
    //         delivery_mode: {
    //             color: "57A9FF",
    //             id: 1,
    //             is_solid: true,
    //             text: "蜂鸟专送"
    //         }
    //     })
    // }

    // 保存数据
    try {
        const shop = await ShopModel.create(newShop)
        res.send({
            status: 1,
            sussess: '添加餐馆成功',
            shopDetail: newShop
        })
    } catch (error) {
        res.send({
            status: 0,
            message: error
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
}

module.exports = {
    addShop
}