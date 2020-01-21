var express = require('express');
var router = express.Router();

const FoodsControl = require('../controls/foods/foods')

router.get('/index_entry', FoodsControl.foodCategory)

module.exports = router;