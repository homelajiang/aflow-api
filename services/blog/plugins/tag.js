const Util = require('../../util');
const Boom = require('@hapi/boom');


module.exports = function (options) {

    this.add('role:tag,cmd:list', async (args, respond) => {
        // TODO 重写查询tag逻辑 记得缓存
        try {
            const pageSize = parseInt(args.pageSize);
            const pageNum = parseInt(args.pageNum);
            const tempList = ['android', 'ios', 'nodejs', 'angular', 'python', 'mongodb'];
            const count  = 6;
            // let tags;
            // let count;
            //
            // if (args.key) {
            //     count = await Tag.find()
            //         .or([
            //             {name: {$regex: new RegExp(args.key, 'i')}},
            //             {alias: {$regex: new RegExp(args.key, 'i')}},
            //             {description: {$regex: new RegExp(args.key, 'i')}}
            //         ])
            //         .countDocuments();
            //     tags = await Tag.find().or([
            //         {name: {$regex: new RegExp(args.key, 'i')}},
            //         {alias: {$regex: new RegExp(args.key, 'i')}},
            //         {description: {$regex: new RegExp(args.key, 'i')}}
            //     ])
            //         .skip((pageNum - 1) * pageSize)
            //         .limit(pageSize)
            //         .sort({create_date: -1});
            // } else {
            //     count = await Tag.countDocuments();
            //     tags = await Tag.find()
            //         .skip((pageNum - 1) * pageSize)
            //         .limit(pageSize)
            //         .sort({create_date: -1});
            // }
            //
            // const tempList = [];
            // tags.forEach((element) => {
            //     tempList.push(element.model);
            // });
            const res = Util.generatePageModel(pageSize, pageNum, count, tempList);
            respond(res);
        } catch (e) {
            respond(Util.generateErr("获取标签列表失败"));
        }
    });

    return 'tag';
};

