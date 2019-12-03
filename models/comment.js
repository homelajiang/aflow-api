const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Util = require('../libs/util');


const CommentSchema = new Schema({
    creator: {
        name: String,
        email: String,
        host: String,
        img: String,
    },
    content: {type: String},
    createDate: Date,
    post: {type: Schema.Types.ObjectId, ref: 'Post'},
    status: String, // 发布  待审核  删除
    deleteReason: String,
    deleteDate: Date
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

CommentSchema.virtual('model')
    .get(function () {
        const p = this.post.model;
        return {
            id: this._id,
            content: this.content,
            createDate: Util.defaultFormat(this.createDate),
            post: {
                id: p.id,
                title: p.title
            },
            status: this.status,
            deleteReason: this.deleteReason,
            deleteDate: Util.defaultFormat(this.deleteDate),
            creator: this.creator
        }
    });

CommentSchema.static({
    getInsertModel: function (model) {
        let temp = {
            createDate: new Date(),
            status: 'published'
        };
        temp.content = model.content ? model.content : '';
        temp.creator = model.creator ? model.creator : {};
        return temp;
    },
    getUpdateModel: function (model) {
        let temp = {
            modifyDate: new Date()
        };

        model.deleteReason ? temp.deleteReason = model.deleteReason : '';
        model.status ? temp.status = model.status : '';
        return temp;
    }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
