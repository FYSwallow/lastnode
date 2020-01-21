var express = require('express');
var router = express.Router();

const BaseControl = require('../controls/base/base')
/* GET home page. */
router.post('/addimg/:type', BaseControl.uploadImg);

module.exports = router;
