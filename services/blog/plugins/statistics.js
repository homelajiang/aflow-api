const Util = require('../../util');
const Boom = require('@hapi/boom');
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
    this.add('role:statistics,cmd:count', async (args, respond) => {

        try {
            const res = {
                count: 0,
                today: 0,
                statistics: []
            };

            const times = 10; // 最近10次的统计结果
            const nowDate = new Date();
            const nowDayOfWeek = nowDate.getDay();//本周第几天
            const nowDay = nowDate.getDate();//当前日
            const nowMonth = nowDate.getMonth();//当前月
            const nowYear = nowDate.getFullYear();//当前年

            if (args.type === 'view') { // 访问量
                const dd = new Date(nowDate.getTime());
                dd.setHours(0);
                dd.setMinutes(0);
                dd.setSeconds(0);
                dd.setMilliseconds(0);
                const startDate = new Date(dd.getTime() - times * 24 * 3600 * 1000);
                const endDate = new Date(dd.getTime() + 24 * 3600 * 1000);
                const resView = await Statistics.find({
                    date: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }, 'date num').sort({date: 1});

                for (let i = -times; i <= 0; i++) {
                    const tt = new Date(dd.getTime() + i * 24 * 60 * 60 * 1000);
                    let temp = 0;
                    resView.some((value) => {//当返回值为true时跳出循环
                        if (value.date.getTime() === tt.getTime()) {
                            temp = value.num;
                            return true;
                        }
                    });

                    if (i === 0) {
                        res.today = temp;
                    } else {
                        const d = {
                            'date': moment(tt).format('YYYYMMDD'),
                            'value': temp
                        };
                        res.statistics.push(d)
                    }
                }
                res.count = await ViewRecord.find().countDocuments();
            } else if (args.type === 'post') { // 文章数量
                for (let i = 0; i > -(times + 1); i--) {
                    const weekRange = Util.getWeekRange(nowYear, nowMonth, nowDay, nowDayOfWeek, i, false);
                    const res = await Post.find({
                        create_date: {$gte: weekRange[0], $lt: weekRange[1]}
                    });

                    if (i === 0) {
                        res.today = res.length;
                    } else {
                        const key = moment(weekRange[0]).format("YYYYMMDD") + "-" + moment(weekRange[1]).format("YYYYMMDD");
                        const d = {
                            'date': key,
                            'value': res.length
                        };
                        res.statistics.unshift(d);
                    }
                }
                res.count = await Post.find().countDocuments();
            } else if (args.type === 'comment') { // 评论数量
                for (let i = -times; i <= 0; i++) {
                    const dayRange = Util.getDayRange(nowDate, i);
                    const res = await Comment.find({create_date: {$gte: dayRange[0], $lt: dayRange[1]}});
                    if (i === 0) {
                        res.today = res.length;
                    } else {
                        const d = {
                            'date': moment(dayRange[0]).format('YYYYMMDD'),
                            'value': res.length
                        };
                        res.statistics.push(d);
                    }
                }
                res.count = await Comment.find().countDocuments();
            } else if (args.type === 'storage') { // todo 多媒体统计
                respond({
                    used: "7Gb",
                    total: "10Gb",
                    percent: 70,
                    mediaCount: 0
                });
                return;
            }
            respond(res);
        } catch (e) {
            respond(Util.generateErr('查询失败', 400));
        }
    });


    // 命名有歧义
    // /**
    //  *  获取文章浏览数
    //  */
    // this.add('role:statistics,cmd:views', async (args, respond) => {
    //     respond(await ViewRecord.find({post: args.id}).countDocuments());
    // });

    /**
     *  获取文章（评论数）排行  今天 近3 天 近7 天 近30 天 近一年 所有
     */
    this.add('role:statistics,cmd:post', async (args, respond) => {
        let startDateTime = getStartDateTime(args.range);
        let posts;

        if (args.type === 'comment') {
            posts = await Comment.aggregate([
                {
                    $match: {
                        create_date: {$gte: startDateTime}
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
        } else { // type === 'view'
            posts = await Statistics.aggregate([
                {//过滤
                    $match: {
                        date: {$gte: startDateTime}
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
        }

        posts = await Post.populate(posts, {path: 'post'});

        //查找post浏览数
        for (let i = 0; i < posts.length; i++) {
            posts[i].views = await ViewRecord.find({post: posts[i]._id}).countDocuments();
            const temp = posts[i].post.model;
            delete temp.password;
            delete temp.content;
            posts[i].post = temp;
        }

        respond(posts);
    });

    // 开启定时任务
    //         schedule.scheduleJob('0 * * * * *', async () => {
    //             console.log('归档访问记录');
    //
    //             //统计过去的一天的数据
    //             let nowDate = new Date();
    //             nowDate.setHours(0);
    //             nowDate.setMinutes(0);
    //             nowDate.setSeconds(0);
    //             nowDate.setMilliseconds(0);
    //
    //             let preDate = new Date(nowDate.getTime() - 24 * 3600 * 1000);
    //
    //             const statistics = {};
    //             statistics['date'] = preDate;
    //             statistics['num'] = await ViewRecord.find({
    //                 date: {$gte: preDate, $lt: nowDate}
    //             }).countDocuments();
    //
    //             statistics['post'] = await ViewRecord.aggregate([
    //                 {
    //                     $match: {
    //                         date: {$gte: preDate, $lt: nowDate},
    //                         post: {$ne: null}
    //                     }
    //                 }, {
    //                     $group: {
    //                         _id: '$post',
    //                         num: {$sum: 1}
    //                     }
    //                 }
    //             ]);
    //              //评论信息直接使用Comment表进行统计
    //             // statistics['comment'] = await Comment.aggregate([
    //             //     {
    //             //         $match: {
    //             //             create_date: {$gte: preDate, $lt: nowDate}
    //             //         }
    //             //     }, {
    //             //         $group: {
    //             //             _id: '$post',
    //             //             num: {$sum: 1}
    //             //         }
    //             //     }
    //             // ]);
    //
    //             await new Statistics(statistics).save();
    //         });

    // 获取指定时间的开始
    function getStartDateTime(type) {
        let startDate = new Date('1970-01-01');

        const nowDate = new Date();
        nowDate.setHours(0);
        nowDate.setMinutes(0);
        nowDate.setSeconds(0);
        nowDate.setMilliseconds(0);

        switch (type) {
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
        return startDate;
    }

    return 'statistics';
};
