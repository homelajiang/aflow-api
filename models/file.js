const mongoose = require('mongoose');
const Util = require('../libs/util');
const BAST_URL = require('../services/config').image_hosting.base_url;
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    name: {type: String, require: true},
    path: {type: String, require: true},
    description: String,
    mimeType: String,
    createDate: {type: Date},
    modifyDate: {type: Date},
    suffixName: String,
    size: Number,
    protected: {type: Boolean, default: false}

}, {
    versionKey: false // You should be aware of the outcome after set to false
});

fileSchema.virtual('model')
    .get(function () {
        return {
            id: this._id,
            name: this.name,
            path: BAST_URL + "upload/" + this.path,
            description: this.description,
            mimeType: this.mimeType,
            suffixName: this.suffixName,
            size: this.size,
            createDate: Util.defaultFormat(this.createDate),
            modifyDate: Util.defaultFormat(this.modifyDate)
        }
    });

fileSchema.static({
    getInsertModel: function (model) {
        let temp = {};
        model.name ? temp.name = model.name : '';
        model.path ? temp.path = model.path : '';
        model.description ? temp.description = model.description : '';
        model.mimeType ? temp.mimeType = model.mimeType : '';
        model.suffixName ? temp.suffixName = model.suffixName : '';
        model.size ? temp.size = model.size : 0;
        temp.createDate = Date.now();
        temp.modifyDate = Date.now();
        temp.protected = !!model.open;
        return temp;
    },
    getUpdateModel: function (model) {
        let temp = {
            modifyDate: Date.now()
        };
        model.name ? temp.name = model.name : '';
        model.description !== undefined ? temp.description = model.description : '';
        return temp;
    }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
