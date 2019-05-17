'use strict';
const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');
const routes = require('./routes/api/index');

// Create a server with a host and port
const server = Hapi.server({
    // host: 'localhost',
    port: 8000,
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    }
});

const options = {
    ops: {
        interval: 1000
    },
    reporters: {
        myConsoleReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{log: '*', response: '*'}]
        }, {
            module: 'good-console'
        }, 'stdout'],
    }
};

// Start the server
const init = async () => {
    await server.register({
        plugin: require('good'),
        options,
    });
    await server.register(Inert);

    // https://github.com/now-ims/hapi-now-auth
    await server.register(require('@now-ims/hapi-now-auth'));

    server.auth.strategy('jwt-strategy', 'hapi-now-auth', {
        verifyJWT: true,
        keychain: ['NeverShareYourSecret'],
        validate: async (request, token, h) => {
            let isValid = true, artifacts;
            const credentials = token.decodedJWT;

            /*            redis.get(token, (error, result) => { // TODO 使用redis管理token的周期
                            if (error) {
                                isValid = false;
                                artifacts.error = error
                                return { isValid, credentials, artifacts };
                            }
                            isValid = true;
                            artifacts.info = result;
                            return { isValid, credentials, artifacts }
                        })*/

            return {isValid, credentials};
        }
    });

    server.auth.default('jwt-strategy');

    server.route(require('./routes/index'));// TODO 接口默认返回信息

    routes.forEach(function (r) {
        server.route(r);
    });

    await server.start();
    return server;
};

init()
    .then(server => {
        console.log('Server running at:', server.info.uri);
    }).catch(err => {
    console.error(err);
});
