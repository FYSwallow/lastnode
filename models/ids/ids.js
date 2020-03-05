
const mongoose = require('mongoose')

const idsSchema = new mongoose.Schema({
	restaurant_id: Number,
	food_id: Number,
	order_id: Number,
	user_id: Number,
	address_id: Number,
	cart_id: Number,
	img_id: Number,
	category_id: Number,
	item_id: Number,
	sku_id: Number, 
	admin_id: Number,
	statis_id: Number,
	shop_category_id: Number,
});

const IdsModel = mongoose.model('Ids', idsSchema);

IdsModel.findOne((err, data) => {
	if (!data) {
		const newIds = new IdsModel({
			restaurant_id: 0,
			food_id: 0,
			order_id: 0,
			user_id: 0,
			address_id: 0,
			cart_id: 0,
			img_id: 0,
			category_id: 0,
			item_id: 0,
			sku_id: 0, 
			admin_id: 0,
			statis_id: 0,
		});
		newIds.save();
	}
})
module.exports = IdsModel