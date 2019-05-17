const moment = require('moment');
const config = require('../services/config');
const Path = require('path');
const Url = require('url');
const Util = require('../libs/util');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    confirmed: {type: Boolean, default: false},//是否认证
    username: {type: String, required: true},//登陆用户名
    nickname: {type: String, default: null},// 用户昵称
    userImg: {type: String, default: '/sa/simg/CN_Logo_Gray.png'},
    gender: {type: Number, default: 0},
    email: {type: String, default: null},//用户邮箱
    signature: {type: String, default: "我这个人很勤，但是什么都没有写。"},
    joinDate: {type: Date, default: Date.now},
    lastLoginDate: {type: Date, default: Date.now},
    mobile: {type: String, default: null}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

//virtual

profileSchema.virtual('model')
    .get(function () {
        return {
            id: this._id,
            username: this.username,
            nickname: this.nickname,
            userImg: Url.resolve(config.image_hosting.base_url, this.userImg),
            gender: this.gender,
            email: this.email,
            signature: this.signature,
            confirmed: this.confirmed,
            role: this.role,
            lastLoginDate: Util.defaultFormat(this.lastLoginDate),
            joinDate: Util.defaultFormat(this.joinDate),
            mobile: getMobile(this.mobile)
        };
    });

profileSchema.virtual('_joinDate')
    .get(function () {
        return moment(this.joinDate).format("YYYY-MM-DD HH:mm:ss");
    });

profileSchema.virtual('_lastLoginDate')
    .get(function () {
        return moment(this.lastLoginDate).format("YYYY-MM-DD HH:mm:ss");
    });


profileSchema.static({
    getUpdateModel: function (model) {
        const temp = {};
        model.nickname ? temp.nickname = model.nickname : '';
        model.userImg ? temp.userImg = model.userImg : '';
        model.gender ? temp.gender = model.gender : '';
        model.email ? temp.email = model.email : '';
        model.signature ? temp.signature = model.signature : '';
        model.mobile ? temp.mobile = model.mobile : '';
        return temp;
        // _.extend(model,{
        //     mo
        // });
        // return _.omit(model, 'confirmed', 'role', 'lastLoginDate', 'joinDate', 'exp', 'time');
    }
});
// userSchema.methods.xxx = function(){
//
// };

// userSchema.method({
//    xxx:{
//
//    }
// });

//没有或者不需要特定的文档是，使用静态方法
// userSchema.static({
//    xxx:{
//
//    }
// });

// Profile.findOne();

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;

function getMobile(mobile) {
    //TODO set mobile
    return mobile;
}
