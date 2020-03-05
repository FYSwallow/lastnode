var express = require('express');
var router = express.Router();

const UploadControl = require('../controls/upload/upload')
/* GET home page. */
router.post('/add', UploadControl.uploadImg);

module.exports = router;
