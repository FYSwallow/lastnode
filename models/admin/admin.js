
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const { encryption } = require('../../utils/util')
const { formateDate } = require('../../utils/dateUtils')
const { getId } = require('../../controls/ids/ids')

const adminSchema = new Schema({
    user_name: String,
    password: String,
    id: Number,
    create_time: String,
    admin: { type: String, default: '管理员' },
    status: Number,  //1:普通管理、 2:超级管理员
    avatar: { type: String, default: 'default.jpg' },
    city: String,
})

adminSchema.index({ id: 1 });

const Admin = mongoose.model('Admin', adminSchema);

// 初始化默认超级管理员用户: admin/admin
Admin.findOne({ user_name: 'admin' }).then(admin => {
    if (!admin) {
        getId('admin_id').then(id => {
            Admin.create(
                {
                    user_name: 'admin',
                    password: encryption('admin'),
                    id,
                    create_time: formateDate(Date.now()),
                    admin: "超级管理员",
                    status: 2,
                    city: "北京"
                })
                .then(admin => {
                    console.log('初始化用户: 用户名: admin 密码为: admin')
                })
        })

    }
})

module.exports = Admin
