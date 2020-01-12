var express = require('express');
var router = express.Router();

const shopControl = require('../controls/shop/index')

router.post('/addshop', shopControl.addShop)
router.get('/getRestaurants', shopControl.getRestaurants)
router.get('/searchRestaurants', shopControl.searchRestaurants)
router.get('/getCategories', shopControl.getCategories)
router.post('/addCategory', shopControl.addCategory)
router.post('/addFood', shopControl.addFood)
router.get('/getDelivery', shopControl.getDelivery) //获取配送方式
router.get('/getActivity', shopControl.getActivity) //获取商家属性活动列表
router.get('/getRestaurantDetail', shopControl.getRestaurantDetail) //获取餐馆详情
router.get('/getFoodList', shopControl.getFoodList) //获取食品列表



module.exports = router;