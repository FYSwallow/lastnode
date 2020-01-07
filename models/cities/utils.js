//获取当前用户的定位
const cityGuess = (model, name) => {
    return new Promise(async (resolve, reject) => {
        const firtWord = name.substr(0, 1).toUpperCase();
        try {
            const city = await model.findOne();
            Object.entries(city.data).forEach(item => {
                if (item[0] == firtWord) {
                    item[1].forEach(cityItem => {
                        if (cityItem.pinyin == name) {
                            resolve(cityItem)
                        }
                    })
                }
            })
        } catch (err) {
            reject({
                name: 'ERROR_DATA',
                message: '查找数据失败',
            });
            console.error(err);
        }
    })
}
exports.cityGuess = cityGuess;

//获取热门城市
const cityHot = (model) => {
    return new Promise(async (resolve, reject) => {
        try {
            const city = await model.findOne();
            resolve(city.data.hotCities)
        } catch (err) {
            reject({
                name: 'ERROR_DATA',
                message: '查找数据失败',
            });
            console.error(err);
        }
    })
}

exports.cityHot = cityHot;

//获取所有城市列表
const cityGroup = (model) => {
    return new Promise(async (resolve, reject) => {
        try {
            const city = await model.findOne();
            const cityObj = city.data;
            delete (cityObj._id)
            delete (cityObj.hotCities)
            resolve(cityObj)
        } catch (err) {
            reject({
                name: 'ERROR_DATA',
                message: '查找数据失败',
            });
            console.error(err);
        }
    })
}

exports.cityGroup = cityGroup;

//通过城市id获取地址详情
const cityDetail = (model, id) => {
    return new Promise(async (resolve, reject) => {
        try{
            const city = await model.findOne();
			Object.entries(city.data).forEach(item => {
				if(item[0] !== '_id' && item[0] !== 'hotCities'){
					item[1].forEach(cityItem => {
						if (cityItem.id == id) {
							resolve(cityItem)
						}
					})
				}
			})
		}catch(err){
			reject({
				name: 'ERROR_DATA',
				message: '查找数据失败',
			});
			console.error(err);
		}
    })
}
exports.cityDetail = cityDetail;
