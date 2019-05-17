const Post = require('../../../models/post');
const Tag = require('../../../models/tag');
const Categories = require('../../../models/categories');
const Util = require('../../util');
/*const async = require('async');
const seneca = require('seneca')();
seneca
    .use("basic")
    .use("entity")
    .use('mongo-store', {
        uri: 'mongodb://localhost:27017/aflow'
    });*/

/*const postSeneca = seneca.make('post');
const tagSeneca = seneca.make('tag');
const categoriesSeneca = seneca.make('categories');*/

/*        postSeneca.native$(function (err, db) {
            var collection = db.collection('posts');
            collection.aggregate([
                {
                    "$sort": {
                        "createDate": -1
                    }
                },
                {
                    "$lookup": {
                        "localField": "categories",
                        "from": "categories",
                        "foreignField": "_id",
                        "as": "categories"
                    }
                },
                {
                    "$unwind": "$categories"
                },
                {
                    "$lookup": {
                        "localField": "creator",
                        "from": "users",
                        "foreignField": "_id",
                        "as": "creator"
                    }
                },
                {
                    "$unwind": "$creator"
                },
                {
                    "$lookup": {
                        "localField": "tags",
                        "from": "tags",
                        "foreignField": "_id",
                        "as": "tags"
                    }
                },
                {
                    "$skip": 0
                },
                {
                    "$limit": 10
                }
            ], respond)
        })*/


module.exports = function (options) {
    //添加post
    this.add('role:post,cmd:add', async (args, respond) => {
        try {
            const post = await new Post(Post.getInsertModel(args.post)).save();
            respond(post.model);
        } catch (e) {
            respond(Util.generateErr("创建文章失败"));
        }
    });

    //查询post(id)
    this.add('role:post,cmd:query', async (args, respond) => {
        try {
            const post = await Post.findById(args.id)
                .populate('categories')
                .populate('tags');
            if (post) {
                respond(post.model);
            } else {
                respond(Util.generateErr("文章不存在", 404));
            }
        } catch (e) {
            respond(Util.generateErr("查询失败"));
        }
    });

//查询post列表
    this.add('role:post,cmd:list', async (args, respond) => {
        try {
            const pageSize = parseInt(args.pageSize);
            const pageNum = parseInt(args.pageNum);

            const type = parseInt(args.type);

            let count;
            let posts;
            // type 为1 已发表 没有type查询所有
            if (args.key) {
                if (isNaN(type)) {//没有type
                    count = await Post.find()
                        .or([
                            {title: {$regex: new RegExp(args.key, 'i')}},
                            {description: {$regex: new RegExp(args.key, 'i')}}
                        ])
                        .countDocuments();

                    posts = await Post.find()
                        .or([
                            {title: {$regex: new RegExp(args.key, 'i')}},
                            {description: {$regex: new RegExp(args.key, 'i')}}
                        ])
                        .populate('categories')
                        .populate('tags')
                        .skip((pageNum - 1) * pageSize)
                        .limit(pageSize)
                        .sort({create_date: -1});
                } else if (type === 1) {
                    count = await Post.find({status: type})
                        .or([
                            {title: {$regex: new RegExp(args.key, 'i')}},
                            {description: {$regex: new RegExp(args.key, 'i')}}
                        ])
                        .countDocuments();

                    posts = await Post.find({status: type})
                        .or([
                            {title: {$regex: new RegExp(args.key, 'i')}},
                            {description: {$regex: new RegExp(args.key, 'i')}}
                        ])
                        .populate('categories')
                        .populate('tags')
                        .skip((pageNum - 1) * pageSize)
                        .limit(pageSize)
                        .sort({publish_date: -1});
                } else {
                    count = await Post.find({status: type})
                        .or([
                            {title: {$regex: new RegExp(args.key, 'i')}},
                            {description: {$regex: new RegExp(args.key, 'i')}}
                        ])
                        .countDocuments();

                    posts = await Post.find({status: type})
                        .or([
                            {title: {$regex: new RegExp(args.key, 'i')}},
                            {description: {$regex: new RegExp(args.key, 'i')}}
                        ])
                        .populate('categories')
                        .populate('tags')
                        .skip((pageNum - 1) * pageSize)
                        .limit(pageSize)
                        .sort({create_date: -1});
                }
            } else {
                if (isNaN(type)) {//没有type
                    count = await Post.find().countDocuments();
                    posts = await Post.find()
                        .populate('categories')
                        .populate('tags')
                        .skip((pageNum - 1) * pageSize)
                        .limit(pageSize)
                        .sort({create_date: -1});
                } else if (type === 1) {
                    count = await Post.find({status: type}).countDocuments();
                    posts = await Post.find({status: type})
                        .populate('categories')
                        .populate('tags')
                        .skip((pageNum - 1) * pageSize)
                        .limit(pageSize)
                        .sort({publish_date: -1});
                } else {
                    count = await Post.find({status: type}).countDocuments();
                    posts = await Post.find({status: type})
                        .populate('categories')
                        .populate('tags')
                        .skip((pageNum - 1) * pageSize)
                        .limit(pageSize)
                        .sort({create_date: -1});
                }
            }
            const tempList = [];
            posts.forEach((element) => {
                tempList.push(element.list_model);
            });
            respond(null, Util.generatePageModel(pageSize, pageNum, count, tempList));
        } catch (e) {
            respond(Util.generateErr("查询失败"));
        }
    });


    //删除post
    this.add('role:post,cmd:remove', async (args, respond) => {
        // Post.remove({_id: {$in: JSON.parse(msg.ids)}}, respond);
        try {
            const res = await Post.findOneAndDelete({_id: args.id});
            if (res) {
                respond(res.model);
            } else {
                respond(Util.generateErr("该文章不存在", 404))
            }
        } catch (e) {
            respond(Util.generateErr("删除失败"));
        }
    });

    //更新post
    this.add('role:post,cmd:update', async (args, respond) => {
        try {

            // 发布日期不能更改，只能更在修改日期
            const temp = await Post.findOne({_id: args.id});

            if (!temp) {
                respond(Util.generateErr("该文章不存在", 404))
                return;
            }

            const updateModel = Post.getUpdateModel(args.post);

            // 当第一次发布并且没有发不过，设置发布日期和修改日期相同，其他情况不允许修改发布日期
            if (!temp.publish_date && updateModel.status === 1) {
                updateModel.publish_date = updateModel.modify_date;
            }

            await Post.updateOne({_id: args.id}, updateModel);
            const post = await Post.findOne({_id: args.id})
                .populate('categories')
                .populate('tags');
            respond(post.model);
        } catch (e) {
            respond(Util.generateErr("更新失败"));
        }
    });

    return 'post';
};
