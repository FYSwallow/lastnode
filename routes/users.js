var express = require('express');
var router = express.Router();

const UsersControl = require('../controls/users/users')

/* GET users listing. */
router.get('/all', UsersControl.getUserList);
router.post('/login', UsersControl.login);
router.get('/captchas', UsersControl.getCaptchas);
router.post('/update/avatar/:user_id', UsersControl.updateAvatar);

module.exports = router;
