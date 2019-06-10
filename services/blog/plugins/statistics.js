const Util = require('../../util');
const Boom = require('boom');
const ViewRecord = require('../../../models/view_record');
const Post = require('../../../models/post');
const moment = require('moment');
const Comment = require('../../../models/comment');
const Statistics = require('../../../models/statistics');

const schedule = require('node-schedule');


module.exports = function (options) {

    /**
     * 添加访问记录
     */
    this.add('role:statistics,cmd:add', (args, respond) => {
        // 添加记录
        try {
            new ViewRecord(args.record).save(); //异步
        } catch (e) {
            console.error("Statistics Record Error:" + e);
        }
        respond(null);//返回一个参数则为结果，两个参数第一个是错误信息
    });

    /**
     * 获取统计结果
     */
    this.add('role:statistics,cmd:all', async (args, respond) => {

        const result = {
            blog: {
                statistics: []
            },
            view: {
                statistics: []
            },
            comment: {
                statistics: []
            },
            storage: { // todo 多媒体统计
                used: "7Gb",
                total: "10Gb",
                percent: 70,
                mediaCount: 0
            }
        };
        const nowDate = new Date();
        const nowDayOfWeek = nowDate.getDay();//本周第几天
        const nowDay = nowDate.getDate();//当前日
        const nowMonth = nowDate.getMonth();//当前月
        const nowYear = nowDate.getFullYear();//当前年


        //最近10周文章量
        for (let i = 0; i > -11; i--) {
            const weekRange = Util.getWeekRange(nowYear, nowMonth, nowDay, nowDayOfWeek, i, false);
            const res = await Post.find({
                create_date: {$gte: weekRange[0], $lt: weekRange[1]}
            });

            if (i === 0) {
                result.blog.current = res.length;
            } else {
                const key = moment(weekRange[0]).format("YYYYMMDD") + "-" + moment(weekRange[1]).format("YYYYMMDD");
                const d = {
                    'date': key,
                    'value': res.length
                };

                result.blog.statistics.unshift(d);
            }
        }

        //最近10天评论量 （查询评论表）

        for (let i = -10; i <= 0; i++) {
            const dayRange = Util.getDayRange(nowDate, i);
            const res = await Comment.find({create_date: {$gte: dayRange[0], $lt: dayRange[1]}});
            if (i === 0) {
                result.comment.current = res.length;
            } else {
                const d = {
                    'date': moment(dayRange[0]).format('YYYYMMDD'),
                    'value': res.length
                };
                result.comment.statistics.push(d);
            }
        }


        //最近10天访问量

        const dd = new Date(nowDate.getTime());
        dd.setHours(0);
        dd.setMinutes(0);
        dd.setSeconds(0);
        dd.setMilliseconds(0);

        const startDate = new Date(dd.getTime() - 10 * 24 * 3600 * 1000);
        const endDate = new Date(dd.getTime() + 24 * 3600 * 1000);

        const resView = await Statistics.find({
            date: {
                $gte: startDate,
                $lt: endDate
            }
        }, 'date num').sort({date: 1});

        for (let i = -10; i <= 0; i++) {
            const tt = new Date(dd.getTime() + i * 24 * 60 * 60 * 1000);
            let temp = 0;
            resView.some((value) => {//当返回值为true时跳出循环
                if (value.date.getTime() === tt.getTime()) {
                    temp = value.num;
                    return true;
                }
            });

            if (i === 0) {
                result.view.current = temp;
            } else {
                const d = {
                    'date': moment(tt).format('YYYYMMDD'),
                    'value': temp
                };
                result.view.statistics.push(d)
            }
        }

        //获取总数量
        //文章
        result.blog.total = await Post.find().countDocuments();//只查询count字段

        //访问量
        result.view.total = await ViewRecord.find().countDocuments();

        //评论数
        result.comment.total = await Comment.find().countDocuments();

        respond(result);
    });

    /**
     *  获取文章浏览数
     */
    this.add('role:statistics,cmd:views', async (args, respond) => {
        respond(await ViewRecord.find({post: args.id}).countDocuments());
    });

    /**
     *  获取文章（评论数）排行  今天 近3 天 近7 天 近30 天 近一年 所有
     */
    this.add('role:statistics,cmd:sort,by:comment', async (args, respond) => {
        let startDate = new Date('1970-01-01');

        const nowDate = new Date();
        nowDate.setHours(0);
        nowDate.setMinutes(0);
        nowDate.setSeconds(0);
        nowDate.setMilliseconds(0);

        switch (args.range) {
            case 'day':
                startDate = nowDate;
                break;
            case 'three day':
                startDate = new Date(nowDate.getTime() - 2 * 24 * 3600 * 1000);
                break;
            case 'week':
                startDate = new Date(nowDate.getTime() - 6 * 24 * 3600 * 1000);
                break;
            case 'month':
                startDate = new Date(nowDate.getTime() - 29 * 24 * 3600 * 1000);
                break;
            case 'year':
                nowDate.setFullYear(nowDate.getFullYear() - 1);
                startDate = nowDate;
                break;
        }

        let posts;

        posts = await Comment.aggregate([
            {
                $match: {
                    create_date: {$gte: startDate}
                }
            },
            {
                $group: {
                    _id: '$post',
                    post: {$first: '$post'},
                    comments: {$sum: 1}
                }
            },
            // { //可对获取到的数据进行过滤
            //     $match: {commentCount: {$gte: 2}}
            // },
            {
                $sort: {
                    comments: -1
                }
            },
            {
                $limit: parseInt(args.limit)
            }
        ]);

        posts = await Post.populate(posts, {path: 'post'});

        //查找post浏览数
        for (let i = 0; i < posts.length; i++) {
            posts[i].views = await ViewRecord.find({post: posts[i]._id}).countDocuments();
            posts[i].post = posts[i].post.simple_model;
        }

        respond(posts);
    });

    /**
     * 获取文章（浏览数）排行 今天 近3天 近7天 近30天 近一年 所有
     */
    this.add('role:statistics,cmd:sort,by:view', async (args, respond) => {
        let startDate = new Date('1970-01-01');

        const nowDate = new Date();
        nowDate.setHours(0);
        nowDate.setMinutes(0);
        nowDate.setSeconds(0);
        nowDate.setMilliseconds(0);

        switch (args.range) {
            case 'day':
                startDate = nowDate;
                break;
            case 'three day':
                startDate = new Date(nowDate.getTime() - 2 * 24 * 3600 * 1000);
                break;
            case 'week':
                startDate = new Date(nowDate.getTime() - 6 * 24 * 3600 * 1000);
                break;
            case 'month':
                startDate = new Date(nowDate.getTime() - 29 * 24 * 3600 * 1000);
                break;
            case 'year':
                nowDate.setFullYear(nowDate.getFullYear() - 1);
                startDate = nowDate;
                break;
        }

        let posts;
        posts = await Statistics.aggregate([
            {//过滤
                $match: {
                    date: {$gte: startDate}
                }
            },
            // 展开post项
            {$unwind: "$post"},
            { //更改结构
                $project: {
                    count: "$post.num",
                    post: "$post._id"
                }
            },
            { // 重新分组
                $group: {
                    _id: "$post",
                    views: {$sum: "$count"},
                    post: {$first: '$post'}
                }
            },
            {
                $sort: {views: -1}
            },
            {
                $limit: parseInt(args.limit)
            }
        ]);
        posts = await Post.populate(posts, {path: 'post'});
        //查找post评论数
        for (let i = 0; i < posts.length; i++) {
            posts[i].comments = await Comment.find({post: posts[i]._id}).countDocuments();
            posts[i].post = posts[i].post.simple_model;
        }
        respond(posts);
    });


    // 开启定时任务
    /*        schedule.scheduleJob('0 * * * * *', async () => {
                console.log('归档访问记录');

                //统计过去的一天的数据
                let nowDate = new Date();
                nowDate.setHours(0);
                nowDate.setMinutes(0);
                nowDate.setSeconds(0);
                nowDate.setMilliseconds(0);

                let preDate = new Date(nowDate.getTime() - 24 * 3600 * 1000);

                const statistics = {};
                statistics['date'] = preDate;
                statistics['num'] = await ViewRecord.find({
                    date: {$gte: preDate, $lt: nowDate}
                }).countDocuments();

                statistics['post'] = await ViewRecord.aggregate([
                    {
                        $match: {
                            date: {$gte: preDate, $lt: nowDate},
                            post: {$ne: null}
                        }
                    }, {
                        $group: {
                            _id: '$post',
                            num: {$sum: 1}
                        }
                    }
                ]);
                 //品论信息直接使用Comment表进行统计
                // statistics['comment'] = await Comment.aggregate([
                //     {
                //         $match: {
                //             create_date: {$gte: preDate, $lt: nowDate}
                //         }
                //     }, {
                //         $group: {
                //             _id: '$post',
                //             num: {$sum: 1}
                //         }
                //     }
                // ]);

                await new Statistics(statistics).save();
            });*/

    return 'statistics';
};
