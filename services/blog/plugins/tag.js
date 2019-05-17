const Tag = require('../../../models/tag');
const Util = require('../../util');
const Boom = require('boom');


module.exports = function (options) {

    //添加tag
    this.add('role:tag,cmd:add', async (args, respond) => {
        try {
            if (await Tag.findOne({name: args.tag.name}))
                return respond(Util.generateErr("标签已存在"));
            const tag = await new Tag(Tag.getInsertModel(args.tag)).save();
            respond(tag.model);
        } catch (e) {
            respond(Util.generateErr("保存失败"))
        }
    });

    //删除tag
    this.add('role:tag,cmd:remove', async (args, respond) => {
        try {
            const res = await Tag.findOneAndDelete({_id: args.id});
            if (res) {
                respond(res.model);
            } else {
                respond(Util.generateErr("标签不存在", 404));
            }
        } catch (e) {
            respond(Util.generateErr("删除失败"));
        }
    });

    //修改tag
    this.add('role:tag,cmd:update', async (args, respond) => {//name 不允许修改
        try {
            await Tag.updateOne({_id: args.id}, Tag.getUpdateModel(args.tag));
            const tag = await Tag.findOne({_id: args.id});
            respond(tag.model);
        } catch (e) {
            respond(Util.generateErr('更新失败'));
        }
    });

    //查询tag
    this.add('role:tag,cmd:query', async (args, respond) => {
        try {
            const tag = await Tag.findById(args.id);
            if (tag) {
                respond(tag.model);
            } else {
                respond(Util.generateErr("该标签不存在", 404));
            }
        } catch (e) {
            respond(Util.generateErr("查询失败"));
        }
    });

    this.add('role:tag,cmd:list', async (args, respond) => {
        try {
            const pageSize = parseInt(args.pageSize);
            const pageNum = parseInt(args.pageNum);

            let tags;
            let count;

            if (args.key) {
                count = await Tag.find()
                    .or([
                        {name: {$regex: new RegExp(args.key, 'i')}},
                        {alias: {$regex: new RegExp(args.key, 'i')}},
                        {description: {$regex: new RegExp(args.key, 'i')}}
                    ])
                    .countDocuments();
                tags = await Tag.find().or([
                    {name: {$regex: new RegExp(args.key, 'i')}},
                    {alias: {$regex: new RegExp(args.key, 'i')}},
                    {description: {$regex: new RegExp(args.key, 'i')}}
                ])
                    .skip((pageNum - 1) * pageSize)
                    .limit(pageSize)
                    .sort({create_date: -1});
            } else {
                count = await Tag.countDocuments();
                tags = await Tag.find()
                    .skip((pageNum - 1) * pageSize)
                    .limit(pageSize)
                    .sort({create_date: -1});
            }

            const tempList = [];
            tags.forEach((element) => {
                tempList.push(element.model);
            });
            respond(Util.generatePageModel(pageSize, pageNum, count, tempList));
        } catch (e) {
            respond(Util.generateErr("获取标签列表失败"));
        }
    });

    return 'tag';
};

