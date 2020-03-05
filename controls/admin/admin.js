// 控制后台页面的接口
const AdminModel = require('../../models/admin/admin')
const { getId } = require('../ids/ids')
const { formateDate } = require('../../utils/dateUtils')
const { getPath } = require('../../utils/util')
const { encryption } = require('../../utils/util') // 获取对密码进行加密函数

// 管理员注册
const register = async (req, res) => {
    const { user_name, password, status = 1 } = req.body
    try {
        if (!user_name) {
            throw new Error('用户名错误')
        } else if (!password) {
            throw new Error('密码错误')
        }
    } catch (err) {
        console.log(err.message, err);
        res.send({
            status: 0,
            type: 'GET_ERROR_PARAM',
            message: err.message,
        })
        return
    }
    try {
        const admin = await AdminModel.findOne({ user_name })
        if (admin) {
            console.log('该用户已经存在');
            res.send({
                status: 0,
                type: 'USER_HAS_EXIST',
                message: '该用户已经存在',
            })
        } else {
            const adminTip = status == 1 ? '管理员' : '超级管理员'
            const admin_id = await getId('admin_id');
            const newpassword = encryption(password);
            const newAdmin = {
                user_name,
                password: newpassword,
                id: admin_id,
                create_time: formateDate(Date.now()),
                admin: adminTip,
                status,
            }
            await AdminModel.create(newAdmin)
            res.send({
                status: 1,
                message: '注册管理员成功',
            })
        }
    } catch (err) {
        res.send({
            status: 0,
            type: 'REGISTER_ADMIN_FAILED',
            message: '注册管理员失败',
        })
    }
}
// 管理员登陆
const login = async (req, res) => {
    // 获取请求参数
    const { user_name, password } = req.body

    try {
        // 判断有无用户名及密码
        if (!user_name) {
            throw new Error('用户名参数错误')
        } else if (!password) {
            throw new Error('密码参数错误')
        }
    } catch (err) {
        console.log(err)
        res.send({
            status: 0,
            message: message.err
        })
    }

    // 对请求中的密码进行加密
    const newpassword = encryption(password);
    try {
        // 根据用户名在数据库中查找该用户
        const admin = await AdminModel.findOne({ user_name })
        if (!admin) {
            res.send({
                status: 0,
                success: '该用户不存在，请注册新用户',
            })
        } else if (newpassword.toString() != admin.password.toString()) {
            console.log('管理员登录密码错误');
            res.send({
                status: 0,
                type: 'ERROR_PASSWORD',
                message: '该用户已存在，密码输入错误',
            })
        } else {
            // 生成一个cookie(userid: user._id), 并交给浏览器保存
            res.cookie('admin_id', admin.id, { maxAge: 1000 * 60 * 60 * 24 })
            res.send({
                status: 1,
                success: '登录成功'
            })
        }
    } catch (err) {
        console.log(err)
        res.send({
            status: 0,
            type: 'LOGIN_ADMIN_FAILED',
            message: '登录管理员失败',
        })
    }
}

// 注销管理员
const deleteAdmin = async (req, res) => {
    const admin_id = req.params.admin_id
    if (!admin_id || !Number(admin_id)) {
        // console.log('获取用户信息的参数user_id无效', user_id)
        res.send({
            status: 0,
            type: 'GET_USER_INFO_FAIELD',
            message: '获取用户信息失败',
        })
        return
    }
    try {
        const admin = await AdminModel.deleteOne({ id: admin_id });
        res.send({
            status: 1,
            success: '删除地址成功',
        })
    } catch (err) {
        console.log('删除收获地址失败', err);
        res.send({
            type: 'ERROR_DELETE_ADDRESS',
            message: '删除收获地址失败'
        })
    }
}
// 获取管理员信息
const getAdminInfo = async (req, res) => {
    const admin_id = req.cookies.admin_id;
    console.log(admin_id)
    if (!admin_id || !Number(admin_id)) {
        // console.log('获取管理员信息的session失效');
        res.send({
            status: 0,
            type: 'ERROR_SESSION',
            message: '获取管理员信息的cookie失效'
        })
        return
    }
    try {
        const info = await AdminModel.findOne({ id: admin_id }, '-_id -__v -password');
        if (!info) {
            throw new Error('未找到当前管理员')
        } else {
            res.send({
                status: 1,
                data: info
            })
        }
    } catch (err) {
        console.log('获取管理员信息失败');
        res.send({
            status: 0,
            type: 'GET_ADMIN_INFO_FAILED',
            message: err.message
        })
    }
}
//退出
const logout = async (req, res) => {
    try {
        // 通知浏览器清除admin_id cookie 
        res.clearCookie('admin_id')
        res.send({
            status: 1,
            success: '退出成功'
        })
    } catch (err) {
        res.send({
            status: 0,
            message: '退出失败'
        })
    }
}


// 获取管理员列表
const getAdminList = async (req, res) => {
    const { limit = 20, offset = 0 } = req.query;
    try {
        const allAdmin = await AdminModel.find({}, '-_id -password').sort({ id: -1 }).skip(Number(offset)).limit(Number(limit))
        res.send(allAdmin)
    } catch (err) {
        console.log('获取超级管理列表失败', err);
        res.send({
            status: 0,
            type: 'ERROR_GET_ADMIN_LIST',
            message: err.message
        })
    }
}

// 获取管理员总数
const getAdminCount = async (req, res) => {
    try {
        const count = await AdminModel.count();
        console.log(count)
        res.send({
            status: 1,
            count
        })
    } catch (err) {
        res.send({
            status: 0,
            type: 'ERROR_GET_ADMIN_COUNT',
            message: '获取管理员数量失败'
        })
    }
}

// 更新管理员头像
const updateAvatar = async (req, res) => {
    const admin_id = req.params.admin_id;
    if (!admin_id || !Number(admin_id)) {
        console.log('admin_id参数错误', admin_id)
        res.send({
            status: 0,
            type: 'ERROR_ADMINID',
            message: 'admin_id参数错误',
        })
        return
    }
    try {
        const image_path = await getPath(req)
        await AdminModel.findOneAndUpdate({ id: admin_id }, { avatar: image_path });
        res.send({
            status: 1,
            data: image_path,
        })
        return
    } catch (err) {
        console.log('上传图片失败', err);
        res.send({
            status: 0,
            type: 'ERROR_UPLOAD_IMG',
            message: err.message
        })
        return
    }
}

module.exports = {
    register,
    login,
    getAdminInfo,
    logout,
    getAdminList,
    getAdminCount,
    updateAvatar,
    deleteAdmin
}