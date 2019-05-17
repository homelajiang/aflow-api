const config = require("../config");
const mongoose = require('mongoose');

mongoose.connect(config.auth.db_connection, {useNewUrlParser: true}, (err) => {
    if (err)
        return console.log(err);
    require('seneca')()
        .use(require('./plugins/auth'))
        .use(require('./plugins/profile'))
        .listen(config.auth.port);
});
mongoose.Promise = global.Promise;
