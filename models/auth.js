const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Profile = require('./profile');

const authSchema = new Schema({
    username: {type: String, required: true},//登陆验证字段
    password: {type: String, required: true},
    status: {type: Number, default: 0},//账号状态 : 0 正常 -1 冻结
    role: {type: Number, default: 0},// 默认0 保留字段
    profile: {type: Schema.Types.ObjectId, ref: 'Profile', require: true}
}, {
    versionKey: false
});

authSchema.virtual('model')
    .get(function () {
        const temp = this.profile.model;
        return {
            auth: {
                id: temp.id,
                username: this.username,
                status: this.status,
                role: this.role
            },
            profile: temp
        };
    });


const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;
