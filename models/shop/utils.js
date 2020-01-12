
const addCategory = async function (model, type) {
    const categoryName = type.split('/');
    try {
        const allcate = await model.findOne();
        const subcate = await model.findOne({ name: categoryName[0] });
        allcate.count++;
        subcate.count++;
        subcate.sub_categories.map(item => {
            if (item.name == categoryName[1]) {
                return item.count++
            }
        })
        await allcate.save();
        await subcate.save();
        console.log('保存cetegroy成功');
        return
    } catch (err) {
        console.log('保存cetegroy失败');
        throw new Error(err)
    }
}

module.exports = addCategory