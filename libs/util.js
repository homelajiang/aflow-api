const JWT = require('jsonwebtoken');  // used to sign our content
const jwtSecret = 'NeverShareYourSecret'; // Never Share This! even in private GitHub repos!
const Boom = require('@hapi/boom');
const moment = require('moment');
const default_format = "YYYY-MM-DD HH:mm:ss";
const date_format = "YYYY-MM-DD";
const path_format = "YYYYMMDD";

module.exports = {
    //生成token
    generateJWT: function (auth) {
        return JWT.sign({
            id: auth.id,
            username: auth.username,
            role: auth.role,
            status: auth.status
        }, jwtSecret);
    },
    response: function (res, h) {
        if (res) {
            return res.error ? Boom.boomify(new Error(res.message), {statusCode: res.code}) : res;
        } else {
            // 没有响应体的成功请求
            return h ? h.response('').code(204) : '';
        }
    },

    validateErr: (request, h, err) => {
        throw  err;
    },

    defaultFormat: (date) => {
        return moment(date).format(default_format);
    },
    dateFormat: (date) => {
        return moment(date).format(date_format);
    },
    datetimePathFormat: (date) => {
        return moment(date).format(path_format);
    }
};
