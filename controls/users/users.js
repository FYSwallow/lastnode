
const UserModel = require('../../models/users/user')
const UserInfoModel = require('../../models/users/userInfo')
const { getId } = require('../../controls/ids/ids')
const { guessPosition } = require('../../controls/cities/cities')
const { formateDate } = require('../../utils/dateUtils')
const { upPic } = require('../../utils/upload-files')

const filter = {password: -1}

const captchapng = require('captchapng')

// 获取所有用户列表
const getUserList = async (req, res, next) => {
    const { limit = 20, offset = 0 } = req.query;
    try {
        const users = await UserInfoModel.find({}, '-_id').sort({ user_id: -1 }).limit(Number(limit)).skip(Number(offset));
        res.send({ status: 1, data: users });
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
const login = async (req, res, next) => {
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
    try {
        const user = await UserModel.findOne({ username });
        //创建一个新的用户
        if (!user) {
            const user_id = await getId('user_id');
            const cityInfo = await guessPosition(req);
            const registe_time = formateDate(Date.now());
            const newUser = { username, password, user_id };
            const newUserInfo = { username, user_id, id: user_id, city: cityInfo.city, registe_time, };
            UserModel.create(newUser);
            const createUser = new UserInfoModel(newUserInfo);
            const userinfo = await createUser.save();
            res.cookie('user_id', user_id, {maxAge: 7*24*60*60*1000});
            res.send({
                status: 1,
                data: userinfo
            });
        } else if (user.password.toString() !== password.toString()) {
            console.log('用户登录密码错误')
            res.send({
                status: 0,
                type: 'ERROR_PASSWORD',
                message: '密码错误',
            })
            return
        } else {
            res.cookie('user_id', user.user_id, {maxAge: 7*24*60*60*1000});
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

// 获取验证码

const getCaptchas = async (req, res, next) => {
    const cap = parseInt(Math.random() * 9000 + 1000);
    const p = new captchapng(80, 30, cap);
    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);
    console.log(p)
    const base64 = p.getBase64();
    //将cookie设置成HttpOnly是为了防止XSS攻击，窃取cookie内容，这样就增加了cookie的安全性，即便是这样，也不要将重要信息存入cookie
    res.cookie('cap', cap, { maxAge: 300000, httpOnly: true });
    res.send({
        status: 1,
        code: 'data:image/png;base64,' + base64
    });
}

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
    try{
        const image_path = await upPic(req);
        await UserInfoModel.findOneAndUpdate({user_id}, {$set: {avatar: image_path}});
        res.send({
            status: 1,
            image_path,
        })
    }catch(err){
        console.log('上传图片失败', err);
        res.send({
            status: 0,
            type: 'ERROR_UPLOAD_IMG',
            message: '上传图片失败'
        })
    }
}

module.exports = {
    getUserList,
    login,
    getCaptchas,
    updateAvatar
}