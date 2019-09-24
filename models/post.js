const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Util = require('../libs/util');

const PostSchema = new Schema({
    title: {type: String},
    description: {type: String},
    content: {type: String},
    createDate: {type: Date},
    modifyDate: {type: Date},
    publishDate: {type: Date},
    cover: {type: String},
    top: {type: Boolean}, //置顶
    open: {type: String},//公开性 0 公开  1 密码保护 2 私密
    password: {type: String},//保护密码
    openComment: {type: Boolean},//是否开放评论
    needReview: {type: Boolean},//评论是否需要审核
    tag: [{type: String}],
    categories: {type: Schema.Types.ObjectId, ref: 'Categories'},
    status: {type: String},//draft 草稿，published 已发布 deleted 已删除
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

PostSchema.virtual('model')
    .get(function () {
        const temp = {
            id: this.id,
            title: this.title,
            description: this.description,
            content: this.content,
            createDate: Util.defaultFormat(this.createDate),
            modifyDate: Util.defaultFormat(this.modifyDate),
            publishDate: Util.defaultFormat(this.publishDate),
            stick: this.stick,
            open: this.open,
            cover: this.cover,
            password: this.password,
            openComment: this.openComment,
            needReview: this.needReview,
            status: this.status,
            tags: this.tags
        };
        temp.categories = this.categories ? this.categories.model : null;
        return temp;
    });

PostSchema.static({
    getInsertModel: function (model) {
        const date = new Date();
        return {
            title: model.title ? model.title : '未命名文章',
            description: model.description ? model.description : '',
            content: model.content ? model.content : '',
            createDate: date,
            modifyDate: date,
            publishDate: date,
            cover: model.cover ? model.cover : '',
            top: !!model.top,
            open: model.open ? model.open : 'public',
            password: model.password ? model.password : '',
            openComment: !!model.openComment,
            needReview: !!model.needReview,
            tag: model.tag ? model.tag : [],
            categories: model.categories ? model.categories : null,
            status: model.status ? model.status : 'draft'
        };
    },
    getUpdateModel: function (model) {
        const date = new Date();
        const temp = {
            modifyDate: date
        };

        model.hasOwnProperty('title') ? temp.title = model.title : '';
        model.hasOwnProperty('description') ? temp.description = model.description : '';
        model.hasOwnProperty('content') ? temp.content = model.content : '';
        model.hasOwnProperty('cover') ? temp.cover = model.cover : '';
        model.hasOwnProperty('top') ? temp.top = model.top : '';
        model.hasOwnProperty('open') ? temp.open = model.open : '';
        model.hasOwnProperty('password') ? temp.password = model.password : '';
        model.hasOwnProperty('openComment') ? temp.openComment = model.openComment : '';
        model.hasOwnProperty('needReview') ? temp.needReview = model.needReview : '';
        model.hasOwnProperty('tag') ? temp.tag = model.tag : '';
        model.hasOwnProperty('categories') ? temp.categories = model.categories : '';
        model.hasOwnProperty('status') ? temp.status = model.status : '';

        // 发布原状态不为已发布的文章时更新发布时间
        if (this.status !== 'published' && model.status === 'published') {
            model.publishDate = date;
        }
        return temp;
    },


});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
