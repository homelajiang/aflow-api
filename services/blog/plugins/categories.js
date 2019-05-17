const Categories = require('../../../models/categories');
const Util = require('../../util');
const Boom = require('boom');


module.exports = function (options) {

    //添加categories
    this.add('role:categories,cmd:add', async (args, respond) => {
        try {
            if (await Categories.findOne({name: args.categories.name}))
                return respond(Util.generateErr("该分类已存在"));
            const categories = await new Categories(Categories.getInsertModel(args.categories)).save();
            respond(categories.model);
        } catch (e) {
            respond(Util.generateErr("创建分类失败"))
        }
    });

    //删除categories
    this.add('role:categories,cmd:remove', async (args, respond) => {
        try {
            const res = await Categories.findOneAndDelete({_id: args.id});
            if (res) {
                respond(res.model);
            } else {
                respond(Util.generateErr("该分类不存在"));
            }
        } catch (e) {
            respond(Util.generateErr("删除失败"));
        }
    });

    //修改categories
    this.add('role:categories,cmd:update', async (args, respond) => {//修改不检查重复
        try {
            await Categories.updateOne({_id: args.id}, Categories.getUpdateModel(args.categories));
            const categories = await Categories.findOne({_id: args.id});
            respond(categories.model);
        } catch (e) {
            respond(Util.generateErr('更新失败'));
        }
    });

    //查询categories
    this.add('role:categories,cmd:query', async (args, respond) => {
        try {
            const categories = await Categories.findById(args.id);
            if (categories) {
                respond(categories.model);
            } else {
                respond(Util.generateErr("该分类不存在",404));
            }
        } catch (e) {
            respond(Util.generateErr("查询失败"));
        }
    });

    this.add('role:categories,cmd:list', async (args, respond) => {
        try {
            const pageSize = parseInt(args.pageSize);
            const pageNum = parseInt(args.pageNum);

            let categories;
            let count;

            if (args.key) {
                count = await Categories.find().or([
                    {name: {$regex: new RegExp(args.key, 'i')}},
                    {alias: {$regex: new RegExp(args.key, 'i')}},
                    {description: {$regex: new RegExp(args.key, 'i')}}
                ])
                    .countDocuments();
                categories = await Categories.find().or([
                    {name: {$regex: new RegExp(args.key, 'i')}},
                    {alias: {$regex: new RegExp(args.key, 'i')}},
                    {description: {$regex: new RegExp(args.key, 'i')}}
                ])
                    .skip((pageNum - 1) * pageSize)
                    .limit(pageSize)
                    .sort({create_date: -1});
            } else {
                count = await Categories.countDocuments();
                categories = await Categories.find()
                    .skip((pageNum - 1) * pageSize)
                    .limit(pageSize)
                    .sort({create_date: -1});
            }
            const tempList = [];
            categories.forEach((element) => {
                tempList.push(element.model);
            });
            respond(Util.generatePageModel(pageSize, pageNum, count, tempList));
        } catch (e) {
            respond(Util.generateErr("获取分类列表失败"));
        }
    });

    return 'categories';
};

