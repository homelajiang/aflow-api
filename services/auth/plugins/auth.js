const Auth = require('../../../models/auth');
const Profile = require('../../../models/profile');
const Boom = require('@hapi/boom');
const Util = require('../../util');

module.exports = function auth(options) {

    //登陆 (just support username)
    this.add('role:auth,cmd:query', async (args, respond) => {
        try {
            //check username
            const auth = await Auth.findOne({username: args.username})
                .populate('profile');

            if (!auth)
                return respond(Util.generateErr("用户不存在", 404));

            if (auth.password !== args.password)
                return respond(Util.generateErr("账户和密码不匹配", 401));

            if (auth.status === -1)
                return respond(Util.generateErr("账号被冻结", 401));

            respond(auth.model);

        } catch (e) {
            respond(Util.generateErr("登录失败,请重试"));
        }
    });

    //sign up
    this.add('role:auth,cmd:add', async (args, respond) => {
        try {
            //username exist?
            const usernameAuth = await Auth.findOne({username: args.username});

            if (usernameAuth)
                return respond(Util.generateErr("用户名已存在", 401));

            //insert
            const profile = await new Profile({
                username: args.username
            }).save();

            let auth = await new Auth({
                username: args.username,
                password: args.password,
                profile: profile._id
            }).save();

            auth = await Auth.findOne({_id: auth._id})
                .populate('profile');

            //back
            respond(auth.model);
        } catch (e) {
            respond(Util.generateErr("注册失败,请重试"));
        }
    });

    return "auth";

};
