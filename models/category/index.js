const mongoose = require('mongoose')
const entryData = require('../../initdata/foodscategort')

const entrySchema = new mongoose.Schema({
	id: Number,
	is_in_serving: Boolean,
	description: String,
	title: String,
	link: String,
	image_url: String,
	icon_url: String,
	title_color: String
});

const EntryModel = mongoose.model('Entry', entrySchema);

//为Entry文档初始化值
EntryModel.findOne((error, data) => {
	if (!data) {
		for (let i = 0; i < entryData.length; i++) {
			EntryModel.create(entryData[i]);
		}
    }
});


module.exports = EntryModel
