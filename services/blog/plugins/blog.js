'use strict';
// 为blog前端提供数据

const Post = require('../../../models/post');
const Comment = require('../../../models/comment');
const Categories = require('../../../models/categories');
const Util = require('../../util');

module.exports = function (options) {

    //获取post列表()
    this.add('role:blog,cmd:post_list', async (args, respond) => {
        try {
            const pageSize = parseInt(args.pageSize);
            const pageNum = parseInt(args.pageNum);

            //已发布 公开/密码保护
            const count = await Post.find({status: 1, open: {$lt: 2}}).countDocuments();
            const posts = await Post.find({status: 1, open: {$lt: 2}})
                .populate('categories')
                .skip((pageNum - 1) * pageSize)
                .limit(pageSize)
                .sort({publish_date: -1});
            const tempList = [];
            posts.forEach((element) => {
                tempList.push(element.blog_model);
            });
            respond(null, Util.generatePageModel(pageSize, pageNum, count, tempList));
        } catch (e) {
            respond(Util.generateErr("获取文章列表失败"));
        }

    });
    //获取comment列表
    this.add('role:blog,cmd:comment_list', async (args, respond) => {
        try {
            const pageSize = parseInt(args.pageSize);
            const pageNum = parseInt(args.pageNum);

            // 审核通过的
            const count = await Comment.find({post: args.id, status: 0}).countDocuments();
            const comments = await Comment.find({post: args.id, status: 0})
                .skip((pageNum - 1) * pageSize)
                .limit(pageSize)
                .sort({create_date: -1});

            const tempList = [];
            comments.forEach((element) => {
                tempList.push(element.blog_model);
            });
            respond(Util.generatePageModel(pageSize, pageNum, count, tempList));
        } catch (e) {
            respond(Util.generateErr("获取评论列表失败"));
        }

    });
    //获取post详情
    this.add('role:blog,cmd:post_info', async (args, respond) => {
        try {
            const post = await Post.findById(args.id)
                .populate('categories');
            // 文章存在，并且文章已发布
            if (post && post.status === 1) {
                respond(post.blog_model);
            } else {
                respond(Util.generateErr("文章不存在", 404));
            }
        } catch (e) {
            respond(Util.generateErr("获取文章信息失败"));
        }
    });
    //获取前后post
    this.add('role:blog,cmd:post_around', async (args, respond) => {
        try {
            const current = await Post.findById(args.id);
            const previousPost = await Post.find({
                status: 1,
                open: {$lt: 2},
                publish_date: {$gt: current.publish_date}
            }).sort({publish_date: 1}).limit(1);
            const nextPost = await Post.find({
                status: 1,
                open: {$lt: 2},
                publish_date: {$lt: current.publish_date}
            }).sort({publish_date: -1}).limit(1);
            respond({
                previous: previousPost.length > 0 ? previousPost[0].simple_model : null,
                next: nextPost.length > 0 ? nextPost[0].simple_model : null
            });
        } catch (e) {
            respond(Util.generateErr("查询文章失败"));
        }
    });
    //获取tag列表
    this.add('role:blog,cmd:tags', async (args, respond) => {
        try {
            const tags = await Tag.find();
            respond(tags);
        } catch (e) {
            respond(Util.generateErr("获取标签列表失败"));
        }

    });
    //获取categories列表
    this.add('role:blog,cmd:categories', async (args, respond) => {
        try {
            const categories = await Categories.find();
            respond(categories);
        } catch (e) {
            respond(Util.generateErr("获取分类列表失败"));
        }
    });

    //获取archives数据
    this.add('role:blog,cmd:archives', async (args, respond) => {

        try { //按年份分组

            const pageSize = parseInt(args.pageSize);
            const pageNum = parseInt(args.pageNum);

            const count = await Post.find({status: 1, open: {$lt: 2}}).countDocuments();
            let posts = await Post.aggregate(
                [
                    {
                        $match: {
                            status: 1, // 已发布
                            open: {$lt: 2} // 0或1 公开，密码保护
                        }
                    },
                    {
                        $sort: {publish_date: -1}
                    },
                    {
                        $skip: (pageNum - 1) * pageSize
                    },
                    {
                        $limit: pageSize
                    },
                    {
                        $group: {
                            _id: {$year: "$publish_date"},
                            count: {$sum: 1},
                            posts: {$push: "$_id"}
                        }
                    },
                    {
                        $sort: {_id: -1}
                    }
                ]);

            //查询
            posts = await Post.populate(posts, {path: 'posts'});
            for (let i = 0; i < posts.length; i++) {
                for (let j = 0; j < posts[i].posts.length; j++) {
                    posts[i].posts[j] = posts[i].posts[j].archive_model;
                }
            }
            respond(null, Util.generatePageModel(pageSize, pageNum, count, posts));
        } catch (e) {
            respond(Util.generateErr("获取归档列表失败"));
        }
    });
    //获取搜索结果（tag categories keyword）
    this.add('role:blog,cmd:search', async (args, respond) => {
        try {
            let posts;
            if (args.type === 'tag') {
                //搜索tag
                const tag = await Tag.findOne({name: args.keyword});
                if (tag) {
                    posts = await Post.find({status: 1, open: {$lt: 2}, tags: {$elemMatch: {$eq: tag._id}}});
                } else {
                    respond(Util.generateErr('标签不存在', 404));
                }
            } else if (args.type === 'categories') {
                //搜索categories
                const categories = await Categories.findOne({name: args.keyword});
                if (categories) {
                    posts = await Post.find({status: 1, open: {$lt: 2}, categories: categories});
                } else {
                    respond(Util.generateErr('分类不存在', 404));
                }
            } else {
                //搜索关键字
                posts = await Post.find({status: 1, open: {$lt: 2}})
                    .or([
                        {title: {$regex: new RegExp(args.keyword, 'i')}},
                        {description: {$regex: new RegExp(args.keyword, 'i')}},
                    ]);
            }

            const tempList = [];
            posts.forEach((element) => {
                tempList.push(element.archive_model);
            });
            respond(tempList);
        } catch (e) {
            respond(Util.generateErr("搜索失败"));
        }

    });


    return 'post';
};
