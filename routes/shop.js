var express = require('express');
var router = express.Router();

const shopControl = require('../controls/shop/index')
const CartControl = require('../controls/cart/cart')

router.post('/addshop', shopControl.addShop) // 添加商家
router.post('/addMenu', shopControl.addMenu) // 添加商家食品分类
router.post('/addFood', shopControl.addFood) // 添加食品

router.post('/updateShop/:restaurant_id', shopControl.updateShop)  //跟新商铺
router.post('/updateFood/:id', shopControl.updateFood)  //跟新商铺

router.get('/deleteshop/:id', shopControl.deleteShop)  //删除商铺
router.get('/deletefood/:id', shopControl.deleteFood)  //删除商铺

router.get('/restaurantsList', shopControl.getRestaurants) // 获取商家列表
router.get('/getMenu', shopControl.getMenu) // 获取商家食品列表
router.get('/getFoods', shopControl.getFoods) //获取所有的食物列表
router.get('/searchRestaurants', shopControl.searchRestaurants) //根据关键字搜索商家
router.get('/getCategories', shopControl.getCategories) // 获取商家食物分类

router.get('/delivery', shopControl.getDelivery) //获取配送方式
router.get('/activity', shopControl.getActivity) //获取商家属性活动列表
router.get('/restaurantDetail/:restaurant_id', shopControl.getRestaurantDetail) //获取餐馆详情

router.get('/ratings/:restaurant_id', shopControl.getRatings) //获取评论列表
router.get('/ratingScroes/:restaurant_id', shopControl.getRatingScroes) //获取评论列表
router.get('/ratingTags/:restaurant_id', shopControl.getRatingTags) //获取评论分类

router.get('/order/count', shopControl.getOrderCount) //获取订单数量
router.post('/checkout', CartControl.checkout) //添加购物车
router.post('/postOrder/:cart_id/:user_id', CartControl.postOrder) //提交订单
router.get('/orders/:user_id', CartControl.getOrders) //获取订单
router.get('/allOrders', CartControl.getAllOrders) //获取所有订单


module.exports = router;