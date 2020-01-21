var express = require('express');
var router = express.Router();

const adminControl = require('../controls/admin/admin')

router.post('/login', adminControl.login); //用户登陆
router.get('/logout', adminControl.logout); //用户推出
router.get('/all', adminControl.getUserList); //获取管理员列表
router.get('/count', adminControl.getAdminCount); //获取管理员总数
router.get('/info', adminControl.getAdminInfo); //获取管理员信息
router.post('/update/avatar/:admin_id', adminControl.updateAvatar); // 更新管理员头像

module.exports = router;