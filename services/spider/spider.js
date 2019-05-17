const config = require("../config");
const mongoose = require('mongoose');
const seneca = require('seneca')();

mongoose.connect(config.spider.db_connection, {}, (err) => {
    if (err)
        return console.log("数据库连接失败。");

    seneca.use(require('./plugins/spider_plugin'))
        .listen(config.spider.port);
    seneca.act('role:spider,cmd:init');

    // require('./plugins/feed_plugin').start();
});

mongoose.Promise = global.Promise;
