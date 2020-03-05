var express = require('express');
var router = express.Router();

const Statis = require('../controls/statis/statis')

// router.get('/user/count', Statis.allUserCount)
// router.get('/order/count', Statis.allOrderCount)
// router.get('/admin/count', Statis.allAdminCount)

router.get('/user/:date/count', Statis.userDayCount)
router.get('/order/:date/count', Statis.orderDayCount)
router.get('/admin/:date/count', Statis.adminDayCount)

module.exports = router;
