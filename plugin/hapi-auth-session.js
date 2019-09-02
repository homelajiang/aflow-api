'use strict';
const Boom = require('@hapi/boom');
const internals = {};

exports.plugin = {
    name: 'hapi-auth-session',
    version: '1.0.0',
    register: async function (server, options) {
        /**
         * 注册一个 scheme 使用 server.auth.scheme(name, scheme)。
         * 其中 name 是一个字符串，用于标明特定的 scheme, 而 scheme 就是上文提到的方法。
         */
        server.auth.scheme('session', internals.implementation);
    }
};

// scheme 是一个拥有签名 function (server, options) 的方法。
internals.implementation = function (server, options) {

    return {
        authenticate: async function (request, h) {
            const user = request.yar.get('user');
            if (user && user.id) {
                return h.authenticated(
                    {
                        credentials: user, //credentials 是一个代表身份验证用户 (或者用户将要进行身份认证的凭证) 的对象。
                        artifacts: user //artifacts 包含了除用户凭证之外的其余验证信息。
                    });
            } else {
                return h.unauthenticated(Boom.unauthorized());
            }
        }
    }
};
