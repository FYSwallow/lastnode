//定义关于城市地点的数据控制
const ajax = require('../../utils/ajax');
const CitiesModel = require('../../models/cities/cities');
const { cityGuess, cityHot, cityGroup, cityDetail } = require('../../models/cities/utils');
const { searchPlace, getCityName } = require('./utils')

const tencentkey = "RRXBZ-WC6KF-ZQSJT-N2QU7-T5QIT-6KF5X"

// 获取城市信息
const getCity = async (req, res) => {
    const type = req.query.type;
    let cityInfo;
    console.log(type)
    switch (type) {
        case "guess":
            const userCity = await guessPosition(req, res);
            console.log(userCity)
            city = await getCityName(userCity);
            cityInfo = await cityGuess(CitiesModel, city);
            break;
        case "hot":
            cityInfo = await cityHot(CitiesModel);
            break;
        case "group":
            cityInfo = await cityGroup(CitiesModel);
            break;
        default:
            res.json({
                name: 'ERROR_QUERY_TYPE',
                message: '参数错误',
            })
            return
    }
    res.send( cityInfo)
}

//根据城市ip获取城市地址详情
const getCityById = async (req, res) => {
    const cityId = req.params.id;
    if (isNaN(cityId)) {
        res.json({
            name: 'ERROR_PARAM_TYPE',
            message: '参数错误',
        })
        return
    }
    try {
        const cityInfo = await cityDetail(CitiesModel, cityId);
        res.send(cityInfo);
    } catch (err) {
        res.send({
            name: 'ERROR_DATA',
            message: '获取数据失败',
        });
    }
}

// 搜索地址
const search = async (req, res) => {
    const { type = 'search', city_id, keyword } = req.query;
    if (!keyword) {
        res.send({
            name: "ERROR_QUERY_TYPE",
            message: "参数错误"
        })
    } else if (isNaN(city_id)) {
        try {
            const city = await guessPosition(req);
            const cityName = await getCityName(city);
            const cityInfo = await cityGuess(CitiesModel, cityName);
            city_id = cityInfo.id;
        } catch (error) {
            res.send({
                name: 'ERROR_GET_POSITION',
                message: '获取数据失败',
            })
        }
    }

    try {
        const cityInfo = await cityDetail(CitiesModel, city_id);
        console.log(keyword, cityInfo.name, type)

        const resObj = await searchPlace(keyword, cityInfo.name, type);
        const cityList = [];
        resObj.data.forEach((item, index) => {
            cityList.push({
                name: item.title,
                address: item.address,
                latitude: item.location.lat,
                longitude: item.location.lng,
                geohash: item.location.lat + ',' + item.location.lng,
            })
        });
        res.send(cityList);
    } catch (error) {
        res.send({
            name: 'GET_ADDRESS_ERROR',
            message: error,
        });
    }
}

//根据腾讯地图获得用户定位
const guessPosition = async (req, res) => {
    let ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0]
    }
    ip = ip.substr(ip.lastIndexOf(':') + 1, ip.length);
    ip = "180.158.102.141";

    const response = await ajax('http://apis.map.qq.com/ws/location/v1/ip', {
        ip,
        key: tencentkey,
    });
    const result = response.data;
    if (result.status == 0) {
        const cityInfo = {
            lat: result.result.location.lat,
            lng: result.result.location.lng,
            city: result.result.ad_info.city,
        }
        cityInfo.city = cityInfo.city.replace(/市$/, '');
        return cityInfo;
    } else {
        return ("定位失败");
    }
}

// 通过ip地址获取精确位置
const geocoder = async (req, res) => {
    try {
        const address = await guessPosition(req);
        const params = {
            key: tencentkey,
            location: address.lat + ',' + address.lng
        };
        const response = await ajax('http://apis.map.qq.com/ws/geocoder/v1/', params);
        const result = response.data;
        if (result.status == 0) {
            const cityInfo = {
                latitude: result.result.location.lat,
                longitude: result.result.location.lng,
                address: result.result.address,
            }
            res.send(cityInfo)
        } else {
            res.send({
                name: 'ERROR_QUERY_TYPE',
                message: err,
            })
        }
    } catch (err) {
        res.send({
            name: 'ERROR_QUERY_TYPE',
            message: err,
        })
    }
}

// 通过geohash获取精确位置
const getPois = async (req, res) => {
    try {
        const geohash = req.params.geohash || '';
        console.log(geohash)

        if (geohash.indexOf(',') == -1) {
            res.send({
                status: 0,
                type: 'ERROR_PARAMS',
                message: '参数错误',
            })
            return;
        }
        const poisArr = geohash.split(',');

        const params = {
            key: tencentkey,
            location: poisArr[0] + ',' + poisArr[1]
        };
        const response = await ajax('http://apis.map.qq.com/ws/geocoder/v1/', params);
        const result = response.data;

        if (result.status == 0) {
            const address = {
                address: result.result.address,
                city: result.result.address_component.province,
                geohash,
                latitude: poisArr[0],
                longitude: poisArr[1],
                name: result.result.formatted_addresses.recommend,
            }
            res.send({
                status: 1,
                data: address
            })
        } else {
            res.send(
                {
                    name: 'ERROR_QUERY_TYPE',
                    message: '通过geohash定位失败'
                }
            )
        }
    } catch (err) {
        res.send(
            {
                name: 'ERROR_QUERY_TYPE',
                message: err
            }
        )
    }
}

module.exports = {
    getCity,
    guessPosition,
    getCityById,
    geocoder,
    getPois,
    search
}