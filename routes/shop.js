var express = require('express');
var router = express.Router();

const shopControl = require('../controls/shop/index')

router.post('/addshop', shopControl.addShop)
// router.get('/restaurants', FoodsControl.foodCategory)
module.exports = router;