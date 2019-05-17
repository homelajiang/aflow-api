const Profile = require('../../../models/profile');
const Boom = require('boom');
const Util = require('../../util');


module.exports = function profile(options) {
    this.add('role:profile,cmd:query', async (args, respond) => {
        try {
            const profile = await Profile.findOne({_id: args.id});
            if (!profile)
                return respond(Util.generateErr("用户不存在", 404));
            respond(profile.model);
        } catch (e) {
            respond(Util.generateErr("获取用户信息失败"));
        }
    });

    this.add('role:profile,cmd:update', async (args, respond) => {
        try {
            await Profile.updateOne({_id: args.id}, Profile.getUpdateModel(args.profile));
            const profile = await Profile.findOne({_id: args.id});

            if (!profile)
                return respond(Util.generateErr("用户不存在", 404));
            respond(profile.model);
        } catch (e) {
            respond(Util.generateErr("更新用户信息失败"));

        }
    });

    return "profile";

};
