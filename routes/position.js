var express = require('express');
var router = express.Router();

const citiesControl = require('../controls/cities/cities')

router.get('/cities', citiesControl.getCity); //根据type类型的不同，获取城市列表
router.get('/cities/:id', citiesControl.getCityById); //根据城市id获取城市信息
router.get('/search', citiesControl.search); //搜索地址
router.get('/geohash/:geohash', citiesControl.getPois); //根据经纬度获取定位
router.get('/exactaddress', citiesControl.geocoder); //获取详细定位


module.exports = router;