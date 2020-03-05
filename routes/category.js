var express = require('express');
var router = express.Router();

const CategoryControl = require('../controls/category/category')

router.get('/shopCategory', CategoryControl.shopCategory) //获取商家分类列表

module.exports = router;