const File = require('../../../models/file');
const Util = require('../../util');
/*
var seneca = require('seneca')();
seneca
    .use("basic")
    .use("entity");*/

module.exports = function (options) {
    this.add('role:file,cmd:add', async (args, respond) => {
        try {
            const file = await new File(File.getInsertModel(args.file)).save();
            respond(file.model);
        } catch (e) {
            respond(Util.generateErr("上传文件失败"))
        }
    });

    this.add('role:file,cmd:list', async (args, respond) => {
        try {
            const pageSize = parseInt(args.pageSize);
            const pageNum = parseInt(args.pageNum);

            let count;
            let files;

            if (args.key) {
                count = await File.find()
                    .or([
                        {name: {$regex: new RegExp(args.key, 'i')}},
                        {description: {$regex: new RegExp(args.key, 'i')}}
                    ])
                    .countDocuments();

                files = await File.find()
                    .or([
                        {name: {$regex: new RegExp(args.key, 'i')}},
                        {description: {$regex: new RegExp(args.key, 'i')}}
                    ])
                    .skip((pageNum - 1) * pageSize)
                    .limit(pageSize)
                    .sort({create_date: -1});
            } else {
                count = await File.find().countDocuments();
                files = await File.find()
                    .skip((pageNum - 1) * pageSize)
                    .limit(pageSize)
                    .sort({create_date: -1});
            }

            const tempList = [];
            files.forEach((element) => {
                tempList.push(element.model);
            });

            respond(Util.generatePageModel(pageSize, pageNum, count, tempList));
        } catch (e) {
            respond(Util.generateErr("获取文件列表失败"));
        }
    });

    this.add('role:file,cmd:remove', async (args, respond) => {
        try {
            const res = await File.findOneAndDelete({_id: args.id});
            if (res) {
                respond(res.model);
            } else {
                respond(Util.generateErr("文件不存在", 404));
            }
        } catch (e) {
            respond(Util.generateErr("删除失败"));
        }
    });

    //更新file
    this.add('role:file,cmd:update', async (args, respond) => {
        try {
            await File.updateOne({_id: args.id}, File.getUpdateModel(args.file));
            const file = await File.findOne({_id: args.id});
            respond(file.model);
        } catch (e) {
            respond(Util.generateErr('更新失败'));
        }
    });

    this.add('role:file,cmd:query', async (args, respond) => {
        try {
            const file = await File.findById(args.id);
            if (file) {
                respond(file.model);
            } else {
                respond(Util.generateErr("文件不存在", 404));
            }
        } catch (e) {
            respond(Util.generateErr("查询失败"));
        }
    });

    return 'image_hosting';
};
