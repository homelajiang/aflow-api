var routes = [
    /*    {
            method: "GET", path: '/', config: {auth: false},
            handler: function (request, h) {
                return "hello world!";
            }
        },
        {
            method: "GET", path: '/token', config: {auth: "jwt"},
            handler: function (request, h) {
                return "hello world!";
            }
        }*/
];

routes = routes
    .concat(require('./auth.js'))
    .concat(require('./file.js'))
    .concat(require('./blog.js'))
    .concat(require('./spider.js'))
    .concat(require('./feed.js'));
module.exports = routes;