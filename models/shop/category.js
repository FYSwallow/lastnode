const mongoose = require('mongoose')
const categoryData = require('../../initdata/category')

const Schema = mongoose.Schema;

const categorySchema = new Schema({
	count: Number,
	id: Number,
	ids: [],
	image_url: String,
	level: Number,
	name: String,
	sub_categories: [
		{
			count: Number,
			id: Number,
			image_url: String,
			level: Number,
			name: String
		},
	]
});

const Category = mongoose.model('Category', categorySchema)


Category.findOne((err, data) => {
	if (!data) {
		for (let i = 0; i < categoryData.length; i++) {
			Category.create(categoryData[i]);
		}
	}
})

module.exports = Category