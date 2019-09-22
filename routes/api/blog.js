const Promise = require('bluebird');
const Config = require('../../services/config');
const Bounce = require('bounce');
const Boom = require('@hapi/boom');
const Joi = require('joi');
const Path = require('path');
const fs = require('fs');
const UUID = require('uuid/v1');
const Util = require('../../libs/util');
const UtilApi = require('../../config_api');


const seneca = require('seneca')()
    .use("basic")
    .use("entity")
    .client(Config.blog.port);

const act = Promise.promisify(seneca.act, {context: seneca});

module.exports = [
    {
        method: 'POST',
        path: UtilApi.api_v1 + '/tag',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: "tag",
                    cmd: 'add',
                    tag: request.payload
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                payload: {
                    name: Joi.string().required(),
                    alias: Joi.string().allow(''),
                    image: Joi.string().allow(''),
                    description: Joi.string().allow('')
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: UtilApi.api_v1 + '/tag/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: "tag",
                    cmd: 'remove',
                    id: request.params.id
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                params: {
                    id: Joi.string().required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: UtilApi.api_v1 + '/tag/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: "tag",
                    cmd: 'update',
                    id: request.params.id,
                    tag: request.payload
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                params: {
                    id: Joi.string().required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: UtilApi.api_v1 + '/tag/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: "tag",
                    cmd: 'query',
                    id: request.params.id
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                params: {
                    id: Joi.string().required()
                }
            }
        }
    },
    {
        method: "GET",
        path: UtilApi.api_v1 + '/tag',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'tag',
                    cmd: 'list',
                    pageSize: request.query.pageSize,
                    pageNum: request.query.pageNum,
                    key: request.query.key
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                query: {
                    pageSize: Joi.number().default(10),
                    pageNum: Joi.number().default(1),
                    key: Joi.string()
                }
            }
        }
    },
    // ==========================================================================
    {
        method: 'POST',
        path: UtilApi.api_v1 + '/categories',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: "categories",
                    cmd: 'add',
                    categories: request.payload
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                payload: {
                    name: Joi.string().required(),
                    alias: Joi.string().allow(null),
                    image: Joi.string().allow(null),
                    description: Joi.string().allow(null)
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: UtilApi.api_v1 + '/categories/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: "categories",
                    cmd: 'remove',
                    id: request.params.id
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                params: {
                    id: Joi.string().required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: UtilApi.api_v1 + '/categories/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: "categories",
                    cmd: 'update',
                    id: request.params.id,
                    categories: request.payload
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                params: {
                    id: Joi.string().required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: UtilApi.api_v1 + '/categories/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: "categories",
                    cmd: 'query',
                    id: request.params.id
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                params: {
                    id: Joi.string().required()
                }
            }
        }
    },
    {
        method: "GET",
        path: UtilApi.api_v1 + '/categories',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'categories',
                    cmd: 'list',
                    pageSize: request.query.pageSize,
                    pageNum: request.query.pageNum,
                    key: request.query.key
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                query: {
                    pageSize: Joi.number().default(10),
                    pageNum: Joi.number().default(1),
                    key: Joi.string()
                }
            }
        }
    },
    //===========================================================================
    {
        method: "POST",
        path: UtilApi.api_v1 + '/post',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'post',
                    cmd: 'add',
                    post: request.payload
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                payload: {
                    title: Joi.string(),
                    content: Joi.string(),
                    description: Joi.string(),
                    open: Joi.string().valid('private', 'public', 'protect'),
                    status: Joi.string().valid('draft','published','deleted'),
                    password: Joi.string(),
                    openComment: Joi.boolean(),
                    needReview: Joi.boolean(),
                    top: Joi.boolean(),
                    tags: Joi.array(),
                    cover: Joi.string(),
                    categories: Joi.string()
                },
                failAction: async (request, h, err) => {
                    if (err.isJoi) {
                        console.log(err.message);
                    }
                    throw err;
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: UtilApi.api_v1 + '/post/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'post',
                    cmd: 'remove',
                    id: request.params.id
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                params: {
                    id: Joi.string().required()
                }
            }
        }
    },
    {
        method: "POST",
        path: UtilApi.api_v1 + '/post/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'post',
                    cmd: 'update',
                    id: request.params.id,
                    post: request.payload
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: {
                    title: Joi.string(),
                    content: Joi.string(),
                    description: Joi.string(),
                    open: Joi.string().valid('private', 'public', 'protect'),
                    status: Joi.string().valid('draft','published','deleted'),
                    password: Joi.string(),
                    openComment: Joi.boolean(),
                    needReview: Joi.boolean(),
                    top: Joi.boolean(),
                    tags: Joi.array(),
                    cover: Joi.string(),
                    categories: Joi.string()
                }
            }
        }
    },
    {
        method: "GET",
        path: UtilApi.api_v1 + '/post/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'post',
                    cmd: 'query',
                    id: request.params.id
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                params: {
                    id: Joi.string().required()
                }
            }
        }
    },
    {
        method: "GET",
        path: UtilApi.api_v1 + '/post',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'post',
                    cmd: 'list',
                    pageSize: request.query.pageSize,
                    pageNum: request.query.pageNum,
                    key: request.query.key,
                    type: request.query.type
                });
                return Util.response(res,h);
            } catch (err) {
                return Boom.badRequest();
            }
        },
        config: {
            validate: {
                query: {
                    pageSize: Joi.number().default(10),
                    pageNum: Joi.number().default(1),
                    key: Joi.string(),
                    type: Joi.string().valid('draft','published','deleted')
                }
            }
        }
    },
//===========================================================================
    {
        method: "POST",
        path:
            UtilApi.api_v1 + '/post/{id}/comment',
        handler:
            async (request, h) => {
                //todo 添加creator
                try {
                    request.payload.creator = "5bceea05a7ebdd1938a6fa9d";
                    const res = await act({
                        role: 'comment',
                        cmd: 'add',
                        id: request.params.id,
                        comment: request.payload
                    });
                    return Util.response(res,h);
                } catch (err) {
                    return Boom.badRequest();
                }
            },
        config:
            {
                validate: {
                    payload: {
                        content: Joi.string().required()
                    }
                }
            }
    }
    ,
    {
        method: 'DELETE',
        path:
            UtilApi.api_v1 + '/comment/{id}',
        handler:
            async (request, h) => {
                try {
                    const res = await act({
                        role: 'comment',
                        cmd: 'remove',
                        id: request.params.id
                    });
                    return Util.response(res,h);
                } catch (err) {
                    return Boom.badRequest();
                }
            },
        config:
            {
                validate: {
                    params: {
                        id: Joi.string().required()
                    }
                }
            }
    },
    {
        method: "POST",
        path:
            UtilApi.api_v1 + '/comment/{id}',
        handler:
            async (request, h) => {
                try {
                    const res = await act({
                        role: 'comment',
                        cmd: 'update',
                        id: request.params.id,
                        comment: request.payload
                    });
                    return Util.response(res,h);
                } catch (err) {
                    return Boom.badRequest();
                }
            },
        config: {
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: {
                    delete_reason: Joi.string(),
                    status:
                        Joi.number().integer().min(-1).max(1).required()
                }
            }
        }
    }
    ,
    {
        method: "GET",
        path:
            UtilApi.api_v1 + '/comment/{id}',
        handler:
            async (request, h) => {
                try {
                    const res = await act({
                        role: 'comment',
                        cmd: 'query',
                        id: request.params.id
                    });
                    return Util.response(res,h);
                } catch (err) {
                    return Boom.badRequest();
                }
            },
        config:
            {
                validate: {
                    params: {
                        id: Joi.string().required()
                    }
                }
            }
    }
    ,
    {
        method: "GET",
        path:
            UtilApi.api_v1 + '/comment',
        handler:
            async (request, h) => {
                try {
                    const res = await act({
                        role: 'comment',
                        cmd: 'list',
                        pageSize: request.query.pageSize,
                        pageNum: request.query.pageNum,
                        id: request.query.postId,
                        key: request.query.key,
                        type: request.query.type
                    });
                    return Util.response(res,h);
                } catch (err) {
                    return Boom.badRequest();
                }
            },
        config:
            {
                validate: {
                    query: {
                        pageSize: Joi.number().default(10),
                        pageNum: Joi.number().default(1),
                        key: Joi.string(),
                        postId: Joi.string(),
                        type: Joi.string().valid('review','published','deleted')
                    },
                    failAction: Util.validateErr
                }
            }
    },
    //获取博客数量统计
    {
        method: "GET",
        path:
            UtilApi.api_v1 + '/statistics',
        handler:
            async (request, h) => {
                try {
                    const res = await act({
                        role: 'statistics',
                        cmd: 'all'
                    });
                    return Util.response(res,h);
                } catch (err) {
                    return Boom.badRequest();
                }
            },
        config:
            {
                validate: {
                    failAction: Util.validateErr
                }
            }
    },
    //获取待处理事项（主要是审批回复）
    {
        method: "GET",
        path:
            UtilApi.api_v1 + '/todos',
        handler:
            async (request, h) => {
                try {
                    const res = await act({
                        role: 'comment',
                        cmd: 'list',
                        pageSize: request.query.pageSize,
                        pageNum: request.query.pageNum,
                        type: 1
                    });
                    return Util.response(res,h);
                } catch (err) {
                    return Boom.badRequest();
                }
            },
        config:
            {
                validate: {
                    query: {
                        pageSize: Joi.number().default(10),
                        pageNum: Joi.number().default(1)
                    },
                    failAction: Util.validateErr
                }
            }
    },
    //按浏览数(评论数)排列文章
    {
        method: 'GET',
        path: UtilApi.api_v1 + '/statistics/post',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'statistics',
                    cmd: 'sort',
                    by: request.query.sort_by,
                    limit: request.query.limit,
                    range: request.query.sort_range
                });
                return Util.response(res,h);
            } catch (e) {
                return Util.errorToBoom(e);
            }
        },
        config: {
            validate: {
                query: {
                    limit: Joi.number().integer().default(5),
                    sort_by: Joi.string().valid(['view', 'comment']).default('view'),
                    sort_range: Joi.string().valid(['day', 'three day', 'week', 'month', 'year', 'all']).default('week')
                },
                failAction: Util.validateErr
            }
        }
    }
];
