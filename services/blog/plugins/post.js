const Post = require('../../../models/post');
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
            respond({id: post._id});
        } catch (e) {
            respond(Util.generateErr("创建文章失败"));
        }
    });

    //查询post(id)
    this.add('role:post,cmd:query', async (args, respond) => {
        try {
            const post = await Post.findById(args.id)
                .populate('categories');
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

            let count;
            let posts;
            // type 为1 已发表 没有type查询所有
            if (args.key) {
                if (args.type) {
                    count = await Post.find({status: args.type})
                        .or([
                            {title: {$regex: new RegExp(args.key, 'i')}},
                            {description: {$regex: new RegExp(args.key, 'i')}}
                        ])
                        .countDocuments();

                    posts = await Post.find({status: args.type})
                        .or([
                            {title: {$regex: new RegExp(args.key, 'i')}},
                            {description: {$regex: new RegExp(args.key, 'i')}}
                        ])
                        .populate('categories')
                        .skip((pageNum - 1) * pageSize)
                        .limit(pageSize)
                        .sort({createDate: -1});
                } else {
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
                        .skip((pageNum - 1) * pageSize)
                        .limit(pageSize)
                        .sort({createDate: -1});
                }
            } else {
                if (args.type) {
                    count = await Post.find({status: args.type}).countDocuments();
                    posts = await Post.find({status: args.type})
                        .populate('categories')
                        .skip((pageNum - 1) * pageSize)
                        .limit(pageSize)
                        .sort({createDate: -1});
                } else {
                    count = await Post.find().countDocuments();
                    posts = await Post.find()
                        .populate('categories')
                        .skip((pageNum - 1) * pageSize)
                        .limit(pageSize)
                        .sort({createDate: -1});
                }
            }
            const tempList = [];
            posts.forEach((element) => {
                let temp = element.model;
                delete temp.content;
                tempList.push(temp);
            });
            respond(Util.generatePageModel(pageSize, pageNum, count, tempList));
        } catch (e) {
            respond(Util.generateErr("查询失败"));
        }
    });

    //删除post
    this.add('role:post,cmd:remove', async (args, respond) => {
        try {
            const res = await Post.findOneAndDelete({_id: args.id});
            res ? respond() : respond(Util.generateErr("该文章不存在", 404));
        } catch (e) {
            respond(Util.generateErr("删除失败"));
        }
    });

    /**
     * 更新post
     * 来什么字段修改什么字段
     * 只有从未发布到发布时才修改发布日期
     */
    this.add('role:post,cmd:update', async (args, respond) => {
        try {

            const temp = await Post.findOne({_id: args.id});

            if (!temp) {
                respond(Util.generateErr("该文章不存在", 404));
                return;
            }

            const updateModel = Post.getUpdateModel(args.post);

            const res = await Post.updateOne({_id: args.id}, {$set: updateModel});
            res ? respond() : respond(Util.generateErr("更新失败", 400))
        } catch (e) {
            respond(Util.generateErr("更新失败"));
        }
    });

    return 'post';
};
