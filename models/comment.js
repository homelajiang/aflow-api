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
    create_date: {type: Date, default: Date.now()},
    post: {type: Schema.Types.ObjectId, ref: 'Post'},
    status: {type: Number, default: 0},//0 发布 1 待审核 -1 删除
    delete_reason: {type: String, default: ''},
    delete_date: {type: Date, default: Date.now()}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

CommentSchema.virtual('model')
    .get(function () {
        return {
            id: this._id,
            content: this.content,
            create_date: Util.defaultFormat(this.create_date),
            post: this.post.simple_model,
            status: this.status,
            delete_reason: this.delete_reason,
            delete_date: Util.defaultFormat(this.delete_date),
            creator: this.creator
        }
    });

CommentSchema.virtual('blog_model')
    .get(function () {
        return {
            id: this._id,
            content: this.content,
            create_date: Util.defaultFormat(this.create_date),
            post: this.post,
            creator: {
                name: this.creator.name,
                host: this.creator.host,
                img: this.creator.img
            }
        }
    });

CommentSchema.static({
    getInsertModel: function (model) {
        let temp = {};
        model.content ? temp.content = model.content : '';
        temp.creator = model.creator ? model.creator : {};
        return temp;
    },
    getUpdateModel: function (model) {
        model.modify_date = Date.now();
        return model;
    }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
