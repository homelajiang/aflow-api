const config = require("../config");
const mongoose = require('mongoose');

mongoose.connect(config.blog.db_connection, {useNewUrlParser: true}, (err) => {
    if (err)
        return console.log("数据库连接失败！！！");
    require('seneca')()
        .use(require('./plugins/blog'))
        .use(require('./plugins/post'))
        .use(require('./plugins/tag'))
        .use(require('./plugins/categories'))
        .use(require('./plugins/comment'))
        .use(require('./plugins/statistics'))
        .listen(config.blog.port);
});
mongoose.Promise = global.Promise;
