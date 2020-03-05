var express = require('express');
var router = express.Router();

const UsersControl = require('../controls/users/users')

/* GET users listing. */
router.post('/login', UsersControl.userLogin); //用户登录
router.get('/logout', UsersControl.userlogout); //用户退出
router.get('/all', UsersControl.getUserList); // 获取所有用户列表
router.get('/userInfo', UsersControl.getUserInfo); // 获取所有用户信息

router.get('/captchas', UsersControl.getCaptchas); // 获取验证码
router.post('/update/avatar/:user_id', UsersControl.updateAvatar); //更新用户头像
router.post('/update/username/:user_id', UsersControl.updateUserName); //更新用户名
router.post('/changepassword', UsersControl.chanegPassword); //更新用户密码

router.post('/address/:user_id', UsersControl.addAddress) // 添加收货地址
router.post('/addressUpdate/:address_id', UsersControl.updateAddress) // 更新收货地址
router.get('/addressList/:user_id', UsersControl.getAddressList) // 获取收货地址列表
router.get('/deleteAddress/:user_id/:address_id', UsersControl.deleteAddress) // 删除收货地址
router.get('/addressDetail/:address_id', UsersControl.getAddressById) // 获取收货地址信息
router.get('/count', UsersControl.getUserCount) // 获取用户总数

module.exports = router;
