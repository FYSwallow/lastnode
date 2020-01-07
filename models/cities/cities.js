const mongoose = require('mongoose')
const cityData = require('../../initdata/cities')

const citySchema = new mongoose.Schema({
	data: {}
});

const CitiesModel = mongoose.model('Cities', citySchema);

//为citySchema文档初始化值
CitiesModel.findOne((error, data) => {
	if (!data) {
		CitiesModel.create({data: cityData});
    }
});


module.exports = CitiesModel
