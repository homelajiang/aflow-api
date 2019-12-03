const Comment = require('../../../models/comment');
const Util = require('../../util');
const Post = require('../../../models/post');
const Boom = require('@hapi/boom');


module.exports = function (options) {

    //添加comment
    this.add('role:comment,cmd:add', async (args, respond) => {
        try {
            const temp = await Post.findOne({_id: args.id});

            if (!temp)
                return respond(Util.generateErr("文章不存在", 404));

            if (!temp.openComment)
                return respond(Util.generateErr("暂不开放评论", 403));

            const comment = Comment.getInsertModel(args.comment);
            comment.post = args.id;

            if (temp.needReview)
                comment.status = 'review';//评论待审核

            const res = await new Comment(comment).save();
            respond(res.model);
        } catch (e) {
            respond(Util.generateErr("评论失败"));
        }

    });

    //查询comment
    this.add('role:comment,cmd:query', async (args, respond) => {
        try {
            const comment = await Comment.findById(args.id)
                .populate("post");
            if (comment) {
                respond(comment.model);
            } else {
                respond(Util.generateErr("评论不存在", 404));
            }
        } catch (e) {
            respond(Util.generateErr("查询失败"));
        }
    });

    this.add('role:comment,cmd:list', async (args, respond) => {
            try {
                const pageSize = parseInt(args.pageSize);
                const pageNum = parseInt(args.pageNum);

                let countExec;
                let listExec;

                if (args.key) {
                    if (args.type) {
                        if (args.id) {
                            countExec = Comment.find({post: args.id, status: args.type})
                                .or([
                                    {content: {$regex: new RegExp(args.key, 'i')}}
                                ]);
                            listExec = Comment.find({post: args.id, status: args.type})
                                .or([
                                    {content: {$regex: new RegExp(args.key, 'i')}}
                                ]);
                        } else {
                            countExec = Comment.find({status: args.type})
                                .or([
                                    {content: {$regex: new RegExp(args.key, 'i')}}
                                ]);
                            listExec = Comment.find({status: args.type})
                                .or([
                                    {content: {$regex: new RegExp(args.key, 'i')}}
                                ]);
                        }
                    } else {
                        if (args.id) {
                            countExec = Comment.find({post: args.id})
                                .or([
                                    {content: {$regex: new RegExp(args.key, 'i')}}
                                ]);
                            listExec = Comment.find({post: args.id})
                                .or([
                                    {content: {$regex: new RegExp(args.key, 'i')}}
                                ]);
                        } else {
                            countExec = Comment.find({})
                                .or([
                                    {content: {$regex: new RegExp(args.key, 'i')}}
                                ]);
                            listExec = Comment.find({})
                                .or([
                                    {content: {$regex: new RegExp(args.key, 'i')}}
                                ]);
                        }
                    }
                } else {
                    if (args.type) {
                        if (args.id) {
                            countExec = Comment.find({post: args.id, status: args.type});
                            listExec = Comment.find({post: args.id, status: args.type});
                        } else {
                            countExec = Comment.find({status: args.type});
                            listExec = Comment.find({status: args.type});
                        }
                    } else {
                        if (args.id) {
                            countExec = Comment.find({post: args.id});
                            listExec = Comment.find({post: args.id});
                        } else {
                            countExec = Comment.find({});
                            listExec = Comment.find({});
                        }
                    }
                }

                const count = await countExec.countDocuments();
                const comments = await listExec.populate("post")
                    .skip((pageNum - 1) * pageSize)
                    .limit(pageSize)
                    .sort({createDate: -1});

                const tempList = [];
                comments.forEach((element) => {
                    tempList.push(element.model);
                });

                respond(Util.generatePageModel(pageSize, pageNum, count, tempList));
            } catch
                (e) {
                respond(Util.generateErr("查询失败"));
            }
        }
    );

    //删除comment
    this.add('role:comment,cmd:remove', async (args, respond) => {
        try {
            const res = await Comment.findOneAndDelete({_id: args.id});
            if (res) {
                respond(res);
            } else {
                respond(Util.generateErr("该评论不存在"), 404);
            }
        } catch (e) {
            respond(Util.generateErr("删除失败"));
        }
    });

    //修改comment
    this.add('role:comment,cmd:update', async (args, respond) => {//修改不检查重复
        try {
            await Comment.updateOne({_id: args.id}, {$set: Comment.getUpdateModel(args.comment)});
            const comment = await Comment.findOne({_id: args.id})
                .populate("post");
            respond(comment.model);
        } catch (e) {
            respond(Util.generateErr("修改失败"));
        }
    });

    return 'comment';
};
