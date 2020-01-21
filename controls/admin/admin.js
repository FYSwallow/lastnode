// 控制后台页面的接口
const AdminModel = require('../../models/admin/admin')
const { getId } = require('../../controls/ids/ids')
const { guessPosition } = require('../../controls/cities/cities')
const { formateDate } = require('../../utils/dateUtils')
const {upPic} = require('../../utils/upload-files')

//登陆
const login = async (req, res) => {
    const { user_name, password, status = 1 } = req.body;
    try {
        if (!user_name) {
            throw new Error('用户名参数错误')
        } else if (!password) {
            throw new Error('密码参数错误')
        }
    } catch (err) {
        res.send({
            status: 0,
            type: 'GET_ERROR_PARAM',
            message: err.message,
        })
        return
    }
    try {
        const admin = await AdminModel.findOne({ user_name });
        if (!admin) {
            const adminTip = status == 1 ? '管理员' : '超级管理员'
            const admin_id = await getId('admin_id');
            const cityInfo = await guessPosition(req);
            const newAdmin = {
                user_name,
                password: password,
                id: admin_id,
                create_time: formateDate(Date.now()),
                admin: adminTip,
                status,
                city: cityInfo.city
            }
            console.log(newAdmin)
            await AdminModel.create(newAdmin)
            res.cookie('admin_id', admin_id, { maxAge: 1000 * 60 * 60 * 24 })
            res.send({
                status: 1,
                success: '注册管理员成功',
            })
        } else if (password.toString() != admin.password.toString()) {
            console.log('管理员登录密码错误');
            res.send({
                status: 0,
                type: 'ERROR_PASSWORD',
                message: '该用户已存在，密码输入错误',
            })
        } else {
            res.cookie('admin_id', admin.id, { maxAge: 1000 * 60 * 60 * 24 })
            res.send({
                status: 1,
                success: '登录成功',
                data: admin
            })
        }
    } catch (err) {
        console.log('登录管理员失败', err);
        res.send({
            status: 0,
            type: 'LOGIN_ADMIN_FAILED',
            message: err.message,
        })
    }
}

//退出
const logout = async (req, res) => {
    try {
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

// 获取用户列表
const getUserList = async (req, res) => {
    const { limit = 20, offset = 0 } = req.query;
    try {
        const allAdmin = await AdminModel.find({}, '-_id -password').sort({ id: -1 }).skip(Number(offset)).limit(Number(limit))
        res.send({
            status: 1,
            data: allAdmin,
        })
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
        res.send({
            status: 1,
            data: count
        })
    } catch (err) {
        res.send({
            status: 0,
            type: 'ERROR_GET_ADMIN_COUNT',
            message: '获取管理员数量失败'
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
        const image_path = await upPic(req)
        await AdminModel.findOneAndUpdate({id: admin_id}, {$set: {avatar: image_path}});
        res.send({
            status: 1,
            image_path,
        })
        return
    } catch(err) {
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
    login,
    logout,
    getUserList,
    getAdminCount,
    getAdminInfo,
    updateAvatar
}