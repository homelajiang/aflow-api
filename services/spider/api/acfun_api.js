var Feed = require("../../../models/feed");
var MediaType = require("../constant/feed_type");
var options = {
    headers: {
        'cache-control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8;utf-8',
        'Accept-encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6'
    },
    encoding: null,
    gzip: true
};

var options_acfun = {
    headers: {
        "udid": '002b086b-a6e4-3d0c-a734-b916d6a0bf2f',
        'market': 'huawei',
        'appVersion': '4.7.1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
        'resolution': '1080x1920',
        'uuid': '43b7e987-d0f2-481a-aa20-8bcf70d37cba',
        'productId': 2000,
        'deviceType': 1,
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6'
    },
    gzip: true
};
var request = require('request');

module.exports = {
    //获取acfun香蕉数最多的视频
    getVideoListByBanana: function () {
        return new Promise(function (resolve, reject) {
            var options = options_acfun;
            options.url = "http://apipc.app.acfun.cn/v2/ranks/1?range=86400000&page={num:1,size:10}";
            request(options, function (err, result, body) {
                if (err) {
                    reject(err);
                    return;
                }
                body = JSON.parse(body);
                if (body.errorid !== 0) {
                    reject(err);
                    return;
                }
                resolve(body.vdata.list);
            });
        })
    },
//获取视频详情
    getVideoInfo: function (id) {
        return new Promise(function (resolve, reject) {
            var options = options_acfun;
            options.url = "http://apipc.app.acfun.cn/v2/videos/" + id;
            request(options, function (err, result, body) {
                if (err) {
                    reject(err);
                    return;
                }
                body = JSON.parse(body);
                if (body.errorid !== 0) {
                    reject(body.errorid);
                    return;
                }
                resolve(body.vdata);
            })
        })
    },
    //获取用户发布的文章
    getArticlesByUser: function (userId, pageNo, pageSize) {
        return new Promise(function (resolve, reject) {
            var options = options_acfun;
            options.url = "http://apipc.app.acfun.cn/v2/user/content?userId="
                + userId + "&type=1&sort=1&pageNo=" + pageNo + "&pageSize=" + pageSize;
            request(options, function (err, result, body) {
                if (err) {
                    reject(err);
                    return;
                }
                body = JSON.parse(body);
                if (body.errorid !== 0) {
                    reject(err);
                    return;
                }
                resolve(body.vdata.list);
            })
        })
    },
//获取文章详情
    getArticleInfo: function (id) {
        return new Promise(function (resolve, reject) {
            var options = options_acfun;
            options.url = "http://apipc.app.acfun.cn/v2/articles/" + id;
            request(options, function (err, result, body) {
                if (err) {
                    reject(err);
                    return;
                }
                body = JSON.parse(body);
                if (body.errorid !== 0) {
                    reject(body.errorid);
                    return;
                }
                resolve(body.vdata);
            })
        })
    }
};
