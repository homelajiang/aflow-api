const Config = require('../../services/config');
const Promise = require('bluebird');
const Bounce = require('bounce');
const Boom = require('@hapi/boom');
const Joi = require('joi');
const Util = require('../../libs/util');
const UtilApi = require('../../config_api');

const seneca = require('seneca')()
    .use('basic')
    .use('entity')
    .client(Config.auth.port);
const act = Promise.promisify(seneca.act, {context: seneca});


module.exports = [
    {
        method: 'POST',
        path: UtilApi.api_v1 + '/signIn',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'auth',
                    cmd: 'query',
                    username: request.payload.username,
                    password: request.payload.password
                });

                if (res.error) {
                    return Util.generateBoom(res);
                } else {
                    return {
                        access_token: Util.generateJWT(res.auth)
                    };
                }

            } catch (err) {
                if (!Boom.isBoom(err))
                    throw Boom.badRequest("登录失败,请重试");
                // Bounce.ignore(err, 'system');
                throw err;
                // return h.response(data).code(201)
            }
        },
        config: {
            auth: false,
            validate: {
                payload: {
                    username: Joi.string().required(),
                    password: Joi.string().required()
                }
                /*                , failAction: async (request, h, err) => {
                                    if (process.env.NODE_ENV === 'production') {
                                        // In prod, log a limited error message and throw the default Bad Request error.
                                        console.error('ValidationError:', err.message); // Better to use an actual logger here.
                                        throw Boom.badRequest(`Invalid request payload input`);
                                    } else {
                                        // During development, log and respond with the full error.
                                        console.error(err);
                                        throw err;
                                    }
                                }*/
            }
        }
    },
    {
        method: 'POST',
        path: UtilApi.api_v1 + '/signUp',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'auth',
                    cmd: 'add',
                    username: request.payload.username,
                    password: request.payload.password
                });
                if (res.error) {
                    return Util.generateBoom(res);
                } else {
                    // res.profile.token = Util.generateJWT(res.auth);
                    res.profile.status = res.auth.status;
                    res.profile.role = res.auth.role;
                    return res.profile;
                }
            } catch (e) {
                if (!Boom.isBoom(e))
                    throw Boom.badRequest("注册失败,请重试");
                throw e;
            }
        },
        config: {
            auth: false,
            validate: {
                payload: {
                    username: Joi.string().required(),
                    password: Joi.string().required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: UtilApi.api_v1 + '/profile/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'profile',
                    cmd: 'query',
                    id: request.params.id
                });

                if (res.error) {
                    return Util.generateBoom(res);
                } else {
                    return res;
                }
            } catch (e) {
                if (!Boom.isBoom(e))
                    throw Boom.badRequest("获取用户信息失败");
                throw e;
            }
        },
        config: {
            auth: false,
            validate: {
                params: {
                    id: Joi.string().required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: UtilApi.api_v1 + '/profile/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'profile',
                    cmd: 'update',
                    id: request.params.id,
                    profile: request.payload
                });

                if (res.error) {
                    return Util.generateBoom(res);
                } else {
                    return res;
                }
            } catch (e) {
                if (!Boom.isBoom(e))
                    throw Boom.badRequest("更新用户信息失败");
                throw e;
            }
        },
        config: {
            auth: false,
            validate: {
                params: {
                    id: Joi.string().required()
                }
            }
        }
    }
];
