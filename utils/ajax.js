/*
ajax请求函数模块
返回值: promise对象(异步返回的数据是: response.data)
 */
const axios = require('axios')
async function ajax (url, data = {}, type = 'GET') {
    let result
    if (type === 'GET') {
        // 准备url query参数数据
        let dataStr = '' //数据拼接字符串
        Object.keys(data).forEach(key => {
            dataStr += key + '=' + data[key] + '&'
        })
        if (dataStr !== '') {
            dataStr = dataStr.substring(0, dataStr.lastIndexOf('&'))
            url = url + '?' + dataStr
        }
        // 发送get请求
        result = await axios.get(url)
    } else {
        // 发送post请求
        result = await axios.post(url, data)
    }
    return result
}
module.exports =  ajax