var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

var FeedTaskSchema = new Schema({
    id: {type: Number, require: true},
    title: {type: String, require: true},
    description: {type: String},
    icon: {type: String},
    update_date: {type: Date, require: true, default: Date.now()},
    // status: {type: Number, require: true, default: 0},//<0 error 0 normal >0 stop
    status_record: [Boolean],//0,1,2
    start_up: {type: Boolean, require: true, default: false},
    update_interval: String
}, {
    versionKey: false
});

FeedTaskSchema.virtual('model')
    .get(function () {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            icon: this.icon,
            update_date: this._update_date,
            status_record: this.status_record,
            start_up: this.start_up,
            update_interval: this.update_interval
        };
    });

FeedTaskSchema.virtual('_update_date')
    .get(function () {
        return moment(this.update_date).format("YYYY-MM-DD HH:mm:ss");
    });

FeedTaskSchema.static({
/*    /!**
     * 获取父菜单列表
     * @param cb
     *!/
    getParentMenus: function (cb) {
        FeedTask.find({parent_id: {$exists: false}})
            .sort({create_date: -1})
            .exec(cb);
    },
    getChildMenus: function (cb) {
        FeedTask.find({parent_id: {$exists: true}})
            .sort({create_date: -1})
            .exec(cb);
    }*/
});

var FeedTask = mongoose.model("feed_task", FeedTaskSchema);

module.exports = FeedTask;