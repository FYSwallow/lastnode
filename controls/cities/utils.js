const pinyin = require('pinyin');
const ajax = require('../../utils/ajax');

const tencentkey = "RRXBZ-WC6KF-ZQSJT-N2QU7-T5QIT-6KF5X"
const baidukey = 'fjke3YUipM9N64GdOIh1DNeK2APO2WcT';
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

//测量距离
const getDistance = async (from, to, type) => {
    try{
        const response = await ajax('http://api.map.baidu.com/routematrix/v2/driving', {
            ak: baidukey,
            output: 'json',
            origins: from,
            destinations: to,
        })
        const res = response.data
        if(res.status == 0){
            const positionArr = [];
            let timevalue;
            res.result.forEach(item => {
                timevalue = parseInt(item.duration.value) + 1200;
                let durationtime = Math.ceil(timevalue%3600/60) + '分钟';
                if(Math.floor(timevalue/3600)){
                    durationtime = Math.floor(timevalue/3600) + '小时' + durationtime;
                }
                positionArr.push({
                    distance: item.distance.text,
                    order_lead_time: durationtime,
                })
            })
            console.log(timevalue + 'timevalue')
            if (type == 'tiemvalue') {
                return timevalue
            }else{
                return positionArr
            }
        }else{
            if (type == 'tiemvalue') {
                return 2000;
            } else {
                throw new Error('调用百度地图测距失败');
            }
        }
    }catch(err){
        console.log('获取位置距离失败');
        throw new Error(err);
    }
}

module.exports = {
    searchPlace,
    getCityName,
    getDistance
}