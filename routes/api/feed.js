const Config = require('../../services/config');
const Promise = require('bluebird');
const Bounce = require('bounce');
const Boom = require('@hapi/boom');
const Joi = require('joi');
const seneca = require('seneca')()
    .use('basic')
    .use('entity')
    .client(Config.feed.port);
var act = Promise.promisify(seneca.act, {context: seneca});

module.exports = [
    {
        method: 'GET',
        path: '/api/v1/feed',
        handler: async (request, h) => {
            try {
                return await act({
                    role: 'feed',
                    cmd: 'list',
                    page: request.query.page,
                    size: request.query.size,
                    channel: 0
                });
            } catch (e) {
                if (!Boom.isBoom(e))
                    e = Boom.badRequest("查询失败");
                throw e;
            }
        },
        config: {
            auth: false,
            validate: {
                query: {
                    page: Joi.number().default(1),
                    size: Joi.number().default(10)
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/v1/activity',
        handler: async (request, h) => {
            try {
                return await act({
                    role: 'feed',
                    cmd: 'list',
                    page: request.query.page,
                    size: request.query.size,
                    channel: 1
                });
            } catch (e) {
                if (!Boom.isBoom(e))
                    e = Boom.badRequest("查询失败");
                throw e;
            }
        },
        config: {
            auth: false,
            validate: {
                query: {
                    page: Joi.number().default(1),
                    size: Joi.number().default(10)
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/v1/feed/{id}',
        handler: async (request, h) => {
            try {
                return await act({
                    role: 'feed',
                    cmd: 'info',
                    id: request.params.id
                });
            } catch (e) {
                if (!Boom.isBoom(e))
                    e = Boom.badRequest("查询失败");
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
        method: 'GET',
        path: '/api/v1/activity/{id}',
        handler: async (request, h) => {
            try {
                return await act({
                    role: 'feed',
                    cmd: 'info',
                    id: request.params.id
                });
            } catch (e) {
                if (!Boom.isBoom(e))
                    e = Boom.badRequest("查询失败");
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
