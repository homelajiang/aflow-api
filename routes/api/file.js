const Promise = require('bluebird');
const Config = require('../../services/config');
const Bounce = require('bounce');
const Boom = require('@hapi/boom');
const Joi = require('joi');
const Path = require('path');
const fs = require('fs');
const UUID = require('uuid/v1');
const IMAGE_ROOT = Path.resolve(__dirname, '../../public');

const Util = require('../../libs/util');
const UtilApi = require('../../config_api');

const seneca = require('seneca')()
    .use("basic")
    .use("entity")
    .client(Config.image_hosting.port);
// Promisify the .act() method; to learn more about this technique see:
// http://bluebirdjs.com/docs/features.html#promisification-on-steroids
const act = Promise.promisify(seneca.act, {context: seneca});


module.exports = [
    {
        method: 'GET',
        path: '/upload/{fileName*2}',
        handler: {
            directory: {
                path: 'uploads/',
                redirectToSlash: true,
                index: true,
            }
        },
        config: {
            auth: false
        }
    },
    {
        method: 'GET',
        path: UtilApi.api_v1 + '/file/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'file',
                    cmd: 'query',
                    id: request.params.id
                });
                if (res.error)
                    return Util.generateBoom(res);
                return res;
            } catch (err) {
                if (!Boom.isBoom(err))
                    err = Boom.badRequest();
                return err;
            }
        }
    },
    {
        method: 'POST',
        path: UtilApi.api_v1 + '/file/{id}',
        handler: async (request, h) => {
            try {
                const res = await act({
                    role: 'file',
                    cmd: 'update',
                    id: request.params.id,
                    file: request.payload
                });
                if (res.error)
                    return Util.generateBoom(res);
                return res;
            } catch (err) {
                // Bounce.ignore(err, { name: 'ValidationError' });       // rethrow any non validation errors, or
                if (!Boom.isBoom(Boom))
                    err = Boom.badRequest();
                return err;
            }
        }
    },
    {
        method: 'GET',
        path: UtilApi.api_v1 + '/file',
        handler: async function (request, h) {
            try {
                return await act({
                    role: 'file',
                    cmd: 'list',
                    pageSize: request.query.pageSize,
                    pageNum: request.query.pageNum,
                    key: request.query.keyword
                });
            } catch (err) {
                Bounce.rethrow(err, {name: 'ValidationError'});       // rethrow any non validation errors, or
                throw Boom.badGateway();
            }
        },
        config: {
            validate: {
                query: {
                    pageSize: Joi.number().default(10),
                    pageNum: Joi.number().default(1),
                    keyword: Joi.string()
                }
            }
        }
    },
    {
        method: 'POST',
        path: UtilApi.api_v1 + '/file',
        config: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 5 * 1024 * 1024
            }
        },
        handler: async (request, h) => {
            try {
                const fileName = Path.basename(request.payload.file.hapi.filename);
                const fileFormat = (fileName).split(".");

                const datetimeDir = Util.datetimePathFormat(Date.now());

                const parentDir = Path.join(IMAGE_ROOT, 'uploads');
                if (!fs.existsSync(parentDir))
                    fs.mkdirSync(parentDir);

                const targetDir = Path.join(parentDir, datetimeDir);

                if (!fs.existsSync(targetDir))
                    fs.mkdirSync(targetDir);

                const targetName = UUID() + "." + fileFormat[fileFormat.length - 1];
                const targetPath = Path.join(targetDir, targetName);
                const encode = request.payload.file._encoding;
                fs.writeFileSync(targetPath, request.payload.file._data, {encoding: encode ? encode : 'utf8'});

                const res = await
                    act({
                        role: 'file',
                        cmd: 'add',
                        file: {
                            name: fileFormat[0],
                            path: datetimeDir + "/" + targetName,
                            mimeType: request.payload.file.hapi.headers["content-type"],
                            suffixName: fileFormat[fileFormat.length - 1],
                            size: request.payload.file._data.length,
                            open: request.payload.open
                        }
                    });

                if (res.error)
                    return Util.generateBoom(res);
                return res;
            } catch (err) {
                if (!Boom.isBoom(err))
                    err = Boom.badRequest();
                return err;
            }
        }
    },
    {
        method: 'DELETE',
        path: UtilApi.api_v1 + '/file/{id}',
        handler: async function (request, h) {
            try {
                const res = await act({role: "file", cmd: "remove", id: request.params.id});
                if (res.error)
                    return Util.generateBoom(res);
                return h.response('deleted').code(204);
            } catch (err) {
                // Bounce.rethrow(err, {name: 'ValidationError'});
                if (!Boom.isBoom(err))
                    err = Boom.badRequest();
                return err;
            }
        },
        config: {
            validate: {
                params: {
                    id: Joi.string().required()
                }
            }
        }
    }
]
;
