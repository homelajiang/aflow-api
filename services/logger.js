const seneca = require('seneca')();

module.exports = {
    debug: function (msg) {
        seneca.log.debug(msg);
    },
    info: function (msg) {
        seneca.log.info(msg);
    },
    warn: function (msg) {
        seneca.log.warn(msg);
    },
    error: function (msg) {
        seneca.log.error(msg);
    },
    fatal: function (msg) {
        seneca.log.fatal(msg);
    }
};
