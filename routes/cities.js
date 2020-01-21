var express = require('express');
var router = express.Router();

const citiesControl = require('../controls/cities/cities')

router.get('/cities', citiesControl.getCity);
router.get('/cities/:id', citiesControl.getCityById);
router.get('/pois', citiesControl.search);
router.get('/pois/:geohash', citiesControl.getPois);
router.get('/exactaddress', citiesControl.geocoder); //获取详细定位


module.exports = router;