const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
    name: {type: String, require: true},
    alias: {type: String},
    image: {type: String},
    description: {type: String},
    create_date: {type: Date}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

tagSchema.virtual('model')
    .get(function () {
        return {
            id: this._id,
            name: this.name,
            alias: this.alias,
            image: this.image,
            description: this.description
        }
    });

tagSchema.static({
    getInsertModel: (model) => {
        const temp = {};
        model.name ? temp.name = model.name : '';
        model.alias ? temp.alias = model.alias : '';
        model.image ? temp.image = model.image : '';
        model.description ? temp.description = model.description : '';
        temp.create_date = new Date();
        return temp;
    },
    getUpdateModel: (model) => {
        const temp = {};
        model.alias !== undefined ? temp.alias = model.alias : '';
        model.image ? temp.image = model.image : '';
        model.description !== undefined ? temp.description = model.description : '';
        return temp;
    },
    /**
     * 搜索和关键字类似的tag列表
     * @param q
     * @param callback
     */
    searchLike: function (q, callback) {
        Tag.find({title: {$regex: q, $options: "$i"}})
            .limit(10)
            .exec(callback);
    },
    getTags: function (pageNo, pageSize, callback) {
        Tag.find({})
            .select('title image')
            .skip((pageNo - 1) * pageSize)
            .exec(callback);
    }
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
