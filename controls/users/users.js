
const captchapng = require('captchapng')
const UserModel = require('../../models/users/user')
const UserInfoModel = require('../../models/users/userInfo')
const AddressModel = require('../../models/users/address')
const { getId } = require('../../controls/ids/ids')
const { guessPosition } = require('../../controls/cities/cities')
const { formateDate } = require('../../utils/dateUtils')
const { getPath } = require('../../utils/util')
const { encryption } = require('../../utils/util')

// 获取所有用户列表
const getUserList = async (req, res, next) => {
    const { limit = 20, offset = 0 } = req.query;
    try {
        const users = await UserInfoModel.find({}, '-_id').sort({ user_id: -1 }).limit(Number(limit)).skip(Number(offset));
        res.send(users);
    } catch (err) {
        console.log('获取用户列表数据失败', err);
        res.send({
            status: 0,
            type: 'GET_DATA_ERROR',
            message: err.message
        })
    }
}

// 用户登陆
const userLogin = async (req, res, next) => {
    const cap = req.cookies.cap;
    if (!cap) {
        console.log('验证码失效')
        res.send({
            status: 0,
            type: 'ERROR_CAPTCHA',
            message: '验证码失效',
        })
        return
    }
    const { username, password, captcha_code } = req.body;
    try {
        if (!username) {
            throw new Error('用户名参数错误');
        } else if (!password) {
            throw new Error('密码参数错误');
        } else if (!captcha_code) {
            throw new Error('验证码参数错误');
        }
    } catch (err) {
        console.log('登陆参数错误', err);
        res.send({
            status: 0,
            type: 'ERROR_QUERY',
            message: err.message,
        })
        return
    }
    if (cap.toString() !== captcha_code.toString()) {
        res.send({
            status: 0,
            type: 'ERROR_CAPTCHA',
            message: '验证码不正确',
        })
        return
    }
    const newpassword = encryption(password);
    console.log(newpassword)
    try {
        const user = await UserModel.findOne({ username });
        //创建一个新的用户
        if (!user) {
            const user_id = await getId('user_id');
            const cityInfo = await guessPosition(req);
            const registe_time = formateDate(Date.now());
            const newUser = { username, password: newpassword.toString(), user_id };
            const newUserInfo = { username, user_id, id: user_id, city: cityInfo.city, registe_time, };
            UserModel.create(newUser);
            const createUser = new UserInfoModel(newUserInfo);
            const userinfo = await createUser.save();
            res.cookie('user_id', user_id, { maxAge: 7 * 24 * 60 * 60 * 1000 });
            res.send({
                status: 1,
                data: userinfo
            });
        } else if (user.password.toString() !== newpassword.toString()) {
            console.log('用户登录密码错误')
            res.send({
                status: 0,
                type: 'ERROR_PASSWORD',
                message: '密码错误',
            })
            return
        } else {
            res.cookie('user_id', user.user_id, { maxAge: 7 * 24 * 60 * 60 * 1000 });
            const userinfo = await UserInfoModel.findOne({ user_id: user.user_id }, '-_id');
            res.send({
                status: 1,
                data: userinfo
            })
        }
    } catch (err) {
        console.log('用户登陆失败', err);
        res.send({
            status: 0,
            type: 'SAVE_USER_FAILED',
            message: err.message,
        })
    }
}

// 用户退出
const userlogout = async (req, res) => {
    res.clearCookie('user_id')
    res.send({
        status: 1,
        message: '退出成功'
    })
}

// 获取验证码

const getCaptchas = async (req, res, next) => {
    const cap = parseInt(Math.random() * 9000 + 1000);
    const p = new captchapng(80, 30, cap);
    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);
    const base64 = p.getBase64();
    //将cookie设置成HttpOnly是为了防止XSS攻击，窃取cookie内容，这样就增加了cookie的安全性，即便是这样，也不要将重要信息存入cookie
    res.cookie('cap', cap, { maxAge: 300000, httpOnly: true });
    res.send({
        status: 1,
        code: 'data:image/png;base64,' + base64
    });
}

// 更新用户头像
const updateAvatar = async (req, res) => {
    const user_id = req.params.user_id
    if (!user_id || !Number(user_id)) {
        console.log('更新头像，user_id错误', user_id)
        res.send({
            status: 0,
            type: 'ERROR_USERID',
            message: err.message,
        })
        return
    }
    try {
        const image_path = await getPath(req);
        await UserInfoModel.findOneAndUpdate({ user_id }, { $set: { avatar: image_path } });
        res.send({
            status: 1,
            image_path,
        })
    } catch (err) {
        console.log('上传图片失败', err);
        res.send({
            status: 0,
            type: 'ERROR_UPLOAD_IMG',
            message: '上传图片失败'
        })
    }
}

// 更新用户密码
const chanegPassword = async (req, res, next) => {
    const cap = req.cookies.cap;
    if (!cap) {
        console.log('验证码失效')
        res.send({
            status: 0,
            type: 'ERROR_CAPTCHA',
            message: '验证码失效',
        })
        return
    }

    const { username, oldpassWord, newpassword, confirmpassword, captcha_code } = req.body;
    try {
        if (!username) {
            throw new Error('用户名参数错误');
        } else if (!oldpassWord) {
            throw new Error('必须添加旧密码');
        } else if (!newpassword) {
            throw new Error('必须填写新密码');
        } else if (!confirmpassword) {
            throw new Error('必须填写确认密码');
        } else if (newpassword !== confirmpassword) {
            throw new Error('两次密码不一致');
        } else if (!captcha_code) {
            throw new Error('请填写验证码');
        }
    } catch (err) {
        console.log('修改密码参数错误', err);
        res.send({
            status: 0,
            type: 'ERROR_QUERY',
            message: err.message,
        })
        return
    }
    if (cap.toString() !== captcha_code.toString()) {
        res.send({
            status: 0,
            type: 'ERROR_CAPTCHA',
            message: '验证码不正确',
        })
        return
    }
    const md5password = encryption(oldpassWord);
    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            res.send({
                status: 0,
                type: 'USER_NOT_FOUND',
                message: '未找到当前用户',
            })
        } else if (user.password.toString() !== md5password.toString()) {
            res.send({
                status: 0,
                type: 'ERROR_PASSWORD',
                message: '密码不正确',
            })
        } else {
            user.password = encryption(newpassword);
            user.save();
            res.send({
                status: 1,
                success: '密码修改成功',
            })
        }
    } catch (err) {
        console.log('修改密码失败', err);
        res.send({
            status: 0,
            type: 'ERROR_CHANGE_PASSWORD',
            message: '修改密码失败',
        })
    }
}

// 获取用户信息
const getUserInfo = async (req, res, next) => {
    const user_id = req.cookies.user_id
    if (!user_id || !Number(user_id)) {
        // console.log('获取用户信息的参数user_id无效', user_id)
        res.send({
            status: 0,
            type: 'GET_USER_INFO_FAIELD',
            message: '通过session获取用户信息失败',
        })
        return
    }
    try {
        const userinfo = await UserInfoModel.findOne({ user_id }, '-_id');
        res.send(userinfo)
    } catch (err) {
        console.log('通过session获取用户信息失败', err);
        res.send({
            status: 0,
            type: 'GET_USER_INFO_FAIELD',
            message: '通过session获取用户信息失败',
        })
    }
}

// 添加收货地址
const addAddress = async (req, res) => {
    const user_id = req.params.user_id
    const { address, address_detail, geohash, name, phone, phone_bk, poi_type = 0, sex, tag, tag_type } = req.body;
    try {
        if (!user_id || !Number(user_id)) {
            throw new Error('用户ID参数错误');
        } else if (!address) {
            throw new Error('地址信息错误');
        } else if (!address_detail) {
            throw new Error('详细地址信息错误');
        } else if (!geohash) {
            throw new Error('geohash参数错误');
        } else if (!name) {
            throw new Error('收货人姓名错误');
        } else if (!phone) {
            throw new Error('收获手机号错误');
        } else if (!sex) {
            throw new Error('性别错误');
        } else if (!tag) {
            throw new Error('标签错误');
        } else if (!tag_type) {
            throw new Error('标签类型错误');
        }
    } catch (err) {
        console.log(err.message);
        res.send({
            status: 0,
            type: 'GET_WRONG_PARAM',
            message: err.message
        })
        return
    }
    try {
        const address_id = await getId('address_id');
        const newAddress = {
            id: address_id,
            address,
            phone,
            phone_bk: phone_bk && phone_bk,
            name,
            st_geohash: geohash,
            address_detail,
            sex,
            tag,
            tag_type,
            user_id,
        }
        await AddressModel.create(newAddress);
        res.send({
            status: 1,
            success: '添加地址成功'
        })
    } catch (err) {
        console.log('添加地址失败', err);
        res.send({
            status: 0,
            type: 'ERROR_ADD_ADDRESS',
            message: '添加地址失败'
        })
    }
}

// 更新收货地址
const updateAddress = async (req, res) => {
    const address_id = req.params.address_id
    const { address, address_detail, geohash, name, phone, phone_bk, poi_type = 0, sex, tag, tag_type } = req.body;
    try {
        if (!address_id || !Number(address_id)) {
            throw new Error('收货ID参数错误');
        } else if (!address) {
            throw new Error('地址信息错误');
        } else if (!address_detail) {
            throw new Error('详细地址信息错误');
        } else if (!geohash) {
            throw new Error('geohash参数错误');
        } else if (!name) {
            throw new Error('收货人姓名错误');
        } else if (!phone) {
            throw new Error('收获手机号错误');
        } else if (!sex) {
            throw new Error('性别错误');
        } else if (!tag) {
            throw new Error('标签错误');
        } else if (!tag_type) {
            throw new Error('标签类型错误');
        }
    } catch (err) {
        console.log(err.message);
        res.send({
            status: 0,
            type: 'GET_WRONG_PARAM',
            message: err.message
        })
        return
    }
    try {
        const newAddress = {
            address,
            phone,
            phone_bk: phone_bk && phone_bk,
            name,
            st_geohash: geohash,
            address_detail,
            sex,
            tag,
            tag_type,
        }
        await AddressModel.findOneAndUpdate({ id: address_id }, newAddress);
        res.send({
            status: 1,
            success: '修改地址成功'
        })
    } catch (err) {
        console.log('修改地址失败', err);
        res.send({
            status: 0,
            type: 'ERROR_ADD_ADDRESS',
            message: '修改地址失败'
        })
    }
}

// 获取收货地址列表
const getAddressList = async (req, res) => {
    const { user_id } = req.params
    if (!user_id || !Number(user_id)) {
        res.send({
            type: 'ERROR_USER_ID',
            message: 'user_id参数错误',
        })
        return
    }
    try {
        const addressList = await AddressModel.find({ user_id }, '-_id');
        res.send({
            status: 1,
            data: addressList
        })
    } catch (err) {
        console.log('获取收获地址失败', err);
        res.send({
            type: 'ERROR_GET_ADDRESS',
            message: '获取地址列表失败'
        })
    }
}
// 删除收货地址
const deleteAddress = async (req, res) => {
    const { user_id, address_id } = req.params;
    if (!user_id || !Number(user_id) || !address_id || !Number(address_id)) {
        res.send({
            type: 'ERROR_PARAMS',
            message: '参数错误',
        })
        return
    }
    try {
        await AddressModel.deleteOne({ id: address_id });
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

//获取用户收货地址信息
const getAddressById = async (req, res) => {
    const address_id = req.params.address_id;
    if (!address_id || !Number(address_id)) {
        res.send({
            type: 'ERROR_PARAMS',
            message: '参数错误',
        })
        return
    }
    try {
        const address = await AddressModel.findOne({ id: address_id });
        res.send(address)
    } catch (err) {
        console.log('获取地址信息失败', err);
        res.send({
            type: 'ERROR_GET_ADDRESS',
            message: '获取地址信息失败'
        })
    }
}

const getUserCount = async (req, res) => {
    try {
        const count = await UserInfoModel.count();
        res.send({
            status: 1,
            count,
        })
    } catch (err) {
        console.log('获取用户数量失败', err);
        res.send({
            status: 0,
            type: 'ERROR_TO_GET_USER_COUNT',
            message: '获取用户数量失败'
        })
    }
}

// 修改用户名
const updateUserName = async (req, res) => {
    const { user_id } = req.params
    const { username } = req.body
    try {
        if (!user_id && !Num(user_id)) {
            throw new Error('请选择正确的用户')
        } else if (!username) {
            throw new Error('请输入新的用户名')
        }
    } catch (error) {
        res.send({
            status: 0,
            message: '请确认请求参数的正确性'
        })
    }
    try {
        const user = await UserModel.findOneAndUpdate({ id: user_id }, { username })
        const userInfo = await UserInfoModel.findOneAndUpdate({ id: user_id }, { username })
        const newUser = await UserInfoModel.findOne({ id: user_id })
        res.send({
            status: 1,
            success: '更新用户名成功',
            data: newUser
        })
    } catch (error) {
        res.send({
            status: 0,
            message: '更新失败'
        })
    }

}

module.exports = {
    getUserList,
    userLogin,
    userlogout,
    getCaptchas,
    updateAvatar,
    chanegPassword,
    getUserInfo,
    addAddress,
    updateAddress,
    getAddressList,
    deleteAddress,
    getAddressById,
    getUserCount,
    updateUserName
}