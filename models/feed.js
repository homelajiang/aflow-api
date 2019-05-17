var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FeedSchema = new Schema({
    type: {
        id: Number,
        value: String,
        name: String
    },
    channel: {type: Number, default: 0},//feed类型，0 默认类型（feed） 1 活动
    uuid: String,
    contentId: String,
    title: String,
    description: String,
    url: String,
    cover: String,
    attachment: [{
        source: String,
        description: String,
        danmakuId: String,
        _id: false
    }],
    releaseDate: Number,
    visit: {
        views: Number,
        score: Number,
        comments: Number,
        danmakuSize: Number
    },
    owner: {
        id: Number,
        name: String,
        avatar: String
    },
    source: {
        name: String,
        url: String
    }
});


FeedSchema.virtual('list_model')
    .get(function () {
        return {
            id: this._id,
            type: this.type,
            channel: this.channel,
            contentId: this.contentId,
            title: this.title,
            description: this.description,
            url: this.url,
            cover: this.cover,
            releaseDate: this.releaseDate,
            visit: this.visit,
            owner: this.owner,
            source: this.source
        }
    });
FeedSchema.virtual('model')
    .get(function () {
        return {
            id: this._id,
            type: this.type,
            channel: this.channel,
            contentId: this.contentId,
            title: this.title,
            description: this.description,
            url: this.url,
            cover: this.cover,
            releaseDate: this.releaseDate,
            visit: this.visit,
            owner: this.owner,
            attachment: this.attachment,
            source: this.source
        }
    });


FeedSchema.static({
    /**
     * 通过uuid查询多媒体信息
     * @param uuid 要查询的多媒体的uuid
     * @param pageNo
     * @param pageSize
     * @param cb
     */
    getMediasByUuid: function (uuid, pageNo, pageSize, cb) {
        Feed.find({uuid: uuid})
            .skip((pageNo - 1) * pageSize)
            .limit(pageSize)
            .sort({releaseDate: -1})
            .exec(cb);
    }
});


var Feed = mongoose.model("Feed", FeedSchema);

module.exports = Feed;