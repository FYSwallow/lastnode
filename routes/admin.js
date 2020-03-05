var express = require('express');
var router = express.Router();

const adminControl = require('../controls/admin/admin')

router.post('/register', adminControl.register); //管理员注册
router.get('/delete/:admin_id', adminControl.deleteAdmin); //注销管理员
router.post('/login', adminControl.login); //管理员登陆
router.get('/info', adminControl.getAdminInfo); //获取管理员信息
router.get('/logout', adminControl.logout); //管理员退出
router.get('/all', adminControl.getAdminList); //获取管理员列表
router.get('/count', adminControl.getAdminCount); //获取管理员总数
router.post('/update/avatar/:admin_id', adminControl.updateAvatar); // 更新管理员头像

module.exports = router