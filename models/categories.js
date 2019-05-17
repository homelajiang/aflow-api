const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
    name: {type: String, require: true},
    alias: {type: String},
    image: {type: String},
    description: {type: String},
    create_date: {type: Date}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

categoriesSchema.virtual('model')
    .get(function () {
        return {
            id: this._id,
            name: this.name,
            alias: this.alias,
            image: this.image,
            description: this.description
        }
    });

categoriesSchema.static({
    getUpdateModel: (model) => {
        const temp = {};
        model.alias !== undefined ? temp.alias = model.alias : '';
        model.image ? temp.image = model.image : '';
        model.description !== undefined ? temp.description = model.description : '';
        return temp;
    },
    getInsertModel: (model) => {
        const temp = {};
        model.name ? temp.name = model.name : '';
        model.alias ? temp.alias = model.alias : '';
        model.image ? temp.image = model.image : '';
        model.description ? temp.description = model.description : '';
        temp.create_date = new Date();
        return temp;
    }
});

const Categories = mongoose.model('Categories', categoriesSchema);

module.exports = Categories;
