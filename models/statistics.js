const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statisticsSchema = new Schema({
    date: Date, // 20181221-00:00 00 000
    num: Number, //访问量
    //文章统计量
    post: [{
        _id: {type: Schema.Types.ObjectId, ref: 'Post'},
        num: Number
    }],
    // //评论统计量
    // comment: [{
    //     _id: {type: Schema.Types.ObjectId, ref: 'Post'},
    //     num: Number
    // }]
}, {
    versionKey: false
});

const Statistics = mongoose.model('Statistics', statisticsSchema);

module.exports = Statistics;
