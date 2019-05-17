var Feed = require("../../../models/feed");
const Boom = require('boom');


module.exports = function feed_plugin(options) {
//获取feed列表
    this.add('role:feed,cmd:list', async (msg, respond) => {
        try {
            const count = await Feed.count();
            var feeds = await Feed.find({channel: msg.channel})
                .limit(msg.size)
                .skip((msg.page - 1) * msg.size)
                .sort({releaseDate: -1})
                .exec();
            var tm = [];
            for (index in feeds) {
                tm.push(feeds[index].list_model);
            }
            var data = handlePageNum(msg.page, msg.size, count);
            data.list = tm;
            respond(null, data);
        } catch (e) {
            respond(Boom.badRequest("数据查询失败"));
        }
    });

    //获取feed详情
    this.add('role:feed,cmd:info', async (msg, respond) => {
        try {
            var feed = await Feed.findOne({_id: msg.id});
            if (!feed)
                throw  Boom.notFound("该feed不存在");
            respond(null, feed.model);
        } catch (e) {
            if (!Boom.isBoom(e))
                e = Boom.badRequest("查询失败");
            respond(e);
        }
    });

    function handlePageNum(page, size, count) {
        return {
            pageSize: size,
            pageNum: page,
            size: count,
            firstPage: page === 1,
            lastPage: page * size >= count,
            hasNextPage: (page + 1) * size <= count,
            hasPreviousPage: (page - 1) * size <= count && (page - 1) > 0,
            list: []
        };

    }
};