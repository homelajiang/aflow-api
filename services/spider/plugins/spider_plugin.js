var AcFun = require("../api/acfun_api");
var Feed = require("../../../models/feed");
var mongoose = require('mongoose');
var config = require('../../config');
var async = require('async');
var SpiderTask = require("../../../models/spider_task");
var FeedType = require('../constant/feed_type');
var FeedSource = require('../constant/feed_source');
var schedule = require('node-schedule');
var scheduleJobs = {};
var UUID = require('uuid/v1');
var tasks = require('../constant/tasks');
const log4js = require('log4js');
log4js.configure({
    appenders: {
        spider: {
            type: 'dateFile',
            filename: 'logs/access',
            pattern: "_yyyy-MM-dd.log",
            alwaysIncludePattern: true,
            maxLogSize: 1024 * 1024,
            backups: 3
        },
        console: {
            type: "console"
        }
    },
    categories: {default: {appenders: ['spider', 'console'], level: 'INFO'}}
});
var logger = log4js.getLogger("Spider");
logger.level = 'INFO';
const Boom = require('boom');

var opts = {
    useMongoClient: true
};

module.exports = function spider_plugin(options) {

    //初始化feed task
    this.add('role:spider,cmd:init', async function (msg, respond) {
        try {
            var taskCount = await SpiderTask.count({});
            if (!taskCount)
                await SpiderTask.create(tasks);
            // await this.act('role:spider,cmd:start');
            const feedTasks = await SpiderTask.find({});
            updateScheduleJobs(feedTasks);
            respond(null);
        } catch (e) {
            respond(Boom.badRequest("init fail."))
        }
    });

    //开始所有任务
    this.add('role:spider,cmd:start', async function (msg, respond) {
        try {
            await SpiderTask.updateMany({}, {$set: {start_up: true}});
            const feedTasks = await SpiderTask.find({});
            updateScheduleJobs(feedTasks);
            respond(null);
        } catch (err) {
            respond(err);
        }
    });
    //停止所有任务
    this.add('role:spider,cmd:stop', async function (msg, respond) {
        try {
            await SpiderTask.updateMany({}, {$set: {start_up: false}});

            const feedTasks = await SpiderTask.find({});
            updateScheduleJobs(feedTasks);
            respond(null);
        } catch (e) {
            respond(e);
        }
    });
    //修改task状态
    this.add('role:spider,cmd:update', async function (msg, respond) {
        try {
            var task = await SpiderTask.findOne({id: msg.taskId});
            await SpiderTask.where({id: msg.taskId})
                .update({start_up: !task.start_up});
            task = await SpiderTask.findOne({id: msg.taskId});
            updateScheduleJob(task);
            respond(task);
        } catch (err) {
            respond(err);
        }
    });
    //获取所有task信息
    this.add('role:spider,cmd:list', async function (msg, respond) {
        try {
            const tasks = await  SpiderTask.find({});
            var ts = [];
            for (index in tasks) {
                ts.push(tasks[index].model);
            }
            respond(ts);
        } catch (err) {
            respond(err);
        }
    });
};

//check all schedule status
function updateScheduleJobs(tasks) {
    for (index in tasks) {
        updateScheduleJob(tasks[index])
    }
}

//update schedule status
function updateScheduleJob(task) {
    var job = scheduleJobs[task.id];
    if (!task.start_up) {//状态为停止
        if (job)
            job.cancel();
        scheduleJobs[task.id] = null;
    } else {//状态为启动
        if (!job)
            scheduleJobs[task.id] = getScheduleJob(task);
    }
}

function getScheduleJob(task) {
    switch (task.id) {
        case 101://AcFun香蕉榜
            var j = schedule.scheduleJob(task.update_interval, function (temp) {
                temp.uuid = UUID();
                startBananaVideoJob(temp);
            }
                .bind(null, task));
            return j;
        case 102://AcFun活动
            return schedule.scheduleJob(task.update_interval, function (temp) {
                temp.uuid = UUID();
                startArticlesJob(temp, "499083");
            }
                .bind(null, task));
        case 103://AcFun专题
            return schedule.scheduleJob(task.update_interval, function (temp) {
                temp.uuid = UUID();
                startArticlesJob(temp, "335261");
            }
                .bind(null, task));
        default:
            scheduleJobLog(task, "the schedule of " + task.id + " not found.");
            return null;
    }
}

async function startBananaVideoJob(task) {
    try {
        task = await SpiderTask.findOne({_id: task._id});
        const videos = await  AcFun.getVideoListByBanana();
        for (i in videos) {
            var video = videos[i];
            var videoInfo = await AcFun.getVideoInfo(video.contentId);
            var vv = handleFeed(videoInfo);
            vv.type = FeedType.video;
            vv.source = FeedSource.acfun;
            vv.channel = 0;
            vv.attachment = [];
            for (index in videoInfo.videos) {
                var t = {
                    source: videoInfo.videos[index].videoId,
                    description: videoInfo.videos[index].title,
                    danmakuId: videoInfo.videos[index].danmakuId
                };
                vv.attachment.push(t);
            }

            await Feed.where({contentId: vv.contentId, source: vv.source})
                .setOptions({upsert: true})
                .update(vv);
        }
        scheduleJobLog(task);
        task.status_record.push(true);
    } catch (e) {
        scheduleJobLog(task, e);
        task.status_record.push(false);
    } finally {
        task.update_date = Date.now();
        if (task.status_record.length > 5)
            task.status_record = task.status_record.slice(-5);
        await SpiderTask.findOne({_id: task._id})
            .update({update_date: task.update_date, status_record: task.status_record});
    }
}

async function startArticlesJob(task, userId) {
    try {
        task = await SpiderTask.findOne({_id: task._id});
        const articles = await AcFun.getArticlesByUser(userId, 1, 5);
        for (i in articles) {
            var article = articles[i];
            var articleInfo = await AcFun.getArticleInfo(article.id);
            var vv = handleFeed(articleInfo);
            vv.type = FeedType.rich_text;
            vv.source = FeedSource.acfun;
            vv.channel = 1;
            vv.attachment = [{
                description: articleInfo.article.content,
                danmakuId: null,
                source: null
            }];
            await Feed.where({contentId: vv.contentId, source: vv.source})
                .setOptions({upsert: true})
                .update(vv);
        }
        scheduleJobLog(task);
        task.status_record.push(true);
    } catch (e) {
        scheduleJobLog(task, e);
        task.status_record.push(false);
    } finally {
        task.update_date = Date.now();
        if (task.status_record.length > 5)
            task.status_record = task.status_record.slice(-5);
        await SpiderTask.findOne({_id: task._id})
            .update({update_date: task.update_date, status_record: task.status_record});
    }
}

function handleFeed(info) {
    return {
        contentId: info.contentId,
        title: info.title,
        description: info.description,
        cover: info.cover,
        releaseDate: info.releaseDate,
        visit: {
            views: info.visit.views,
            comments: info.visit.comments,
            score: info.visit.goldBanana,
            danmakuSize: info.danmakuSize ? info.danmakuSize : 0
        },
        owner: {
            id: info.owner.id,
            name: info.owner.name,
            avatar: info.owner.avatar
        }
    };
}

function scheduleJobLog(task, err) {
    if (err) {
        logger.error("[error]" + task.id + " - " + task.title + " " + err);
    } else {
        logger.info("[task] " + task.id + " - " + task.title);
    }
}
