const pinyin = require('pinyin');
const ajax = require('../../utils/ajax');

const tencentkey = "RRXBZ-WC6KF-ZQSJT-N2QU7-T5QIT-6KF5X"


//搜索地址
const searchPlace = async (keyword, cityName, type = 'search') => {
    try {
        const response = await ajax('http://apis.map.qq.com/ws/place/v1/search', {
            key: tencentkey,
            keyword: encodeURIComponent(keyword),
            boundary: 'region(' + encodeURIComponent(cityName) + ',0)',
            page_size: 10,
        });
        const resObj = response.data;
        if (resObj.status == 0) {
            return resObj
        } else {
            throw new Error('搜索位置信息失败');
        }
    } catch (err) {
        throw new Error(err);
    }
}

// 获取定位城市名拼音
const getCityName = async (userCity) => {
    const pinyinArr = pinyin(userCity.city, {
        style: pinyin.STYLE_NORMAL,
    });
    let cityName = '';
    pinyinArr.forEach(item => {
        cityName += item[0];
    })
    return cityName;
}

module.exports = {
    searchPlace,
    getCityName
}