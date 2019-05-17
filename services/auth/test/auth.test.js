const Seneca = require('seneca');
const mongoose = require('mongoose');
const config = require("../../config");
const async = require('async');
const should = require('should');

const Profile = require('../../../models/profile');
const Auth = require('../../../models/auth');

let auth;

describe('auth_test', () => {

    before((done) => {
        async.waterfall([
            (cb) => {
                mongoose.connect(config.auth.db_connection,
                    {useNewUrlParser: true},
                    (err) => {
                        cb(err);
                    })
            }
        ], (err, res) => {
            done(err, res);
        });
    });

    after((done) => {
        async.waterfall([
            (cb) => {
                Profile.deleteOne({_id: auth.profile._id}, cb);
            },
            (data, cb) => {
                Auth.deleteOne({_id: auth._id}, cb);
            }
        ], (err, res) => {
            done(err, res);
        });
    });

    it('Sign Up', (done) => {
        const seneca = test_seneca(done);
        seneca
            .gate()
            .act({
                role: 'auth',
                cmd: 'add',
                username: "homelajiang",
                password: "123456789"
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("username", "homelajiang");
                res.should.have.property("status", 0);
                res.should.have.property("role", 0);
                auth = res;
            })
            .ready(done);
    });

    it('Sign In', (done) => {
        const seneca = test_seneca(done);
        seneca.act({
            role: 'auth',
            cmd: 'query',
            username: 'homelajiang',
            password: "123456789"
        }, (err, res) => {
            should.not.exist(err);
            should.exist(res);
            res.should.have.property("username", "homelajiang");
            res.should.have.property("status", 0);
            res.should.have.property("role", 0);
            done();
        })
    })

});


function test_seneca(cb) {
    return Seneca({log: 'test'})
        .test(cb,'print')
        .use(require('../plugins/auth'));
}
