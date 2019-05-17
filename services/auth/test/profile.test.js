const Seneca = require('seneca');
const mongoose = require('mongoose');
const config = require("../../config");
const async = require('async');
const should = require('should');

const Profile = require('../../../models/profile');

describe('profile_test', () => {

    let profile;

    before((done) => {
        async.waterfall([
            (cb) => {
                mongoose.connect(config.auth.db_connection,
                    {useNewUrlParser: true},
                    (err) => {
                        cb(err);
                    })
            },
            (cb) => {
                new Profile({username: "test_jfldjslfd"})
                    .save((err, res) => {
                        if (!err)
                            cb(err, res);
                        profile = res;
                    });
            }
        ], (err, res) => {
            done(err, res);
        });
    });

    after((done) => {
        async.waterfall([
            (cb) => {
                Profile.deleteOne({_id: profile._id}, cb);
            }
        ], (err, res) => {
            done(err, res);
        });
    });

    it('Query Profile', (done) => {
        const seneca = test_seneca(done);
        seneca
            .act({
                role: 'profile',
                cmd: 'query',
                id: profile._id
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("username", "test_jfldjslfd");
                done();
            });
    });

    it('Update Profile', (done) => {
        const seneca = test_seneca(done);
        seneca.act({
            role: 'profile',
            cmd: 'update',
            id: profile._id,
            profile: {
                nickname: "yuan"
            }
        }, (err, res) => {
            should.not.exist(err);
            should.exist(res);
            res.should.have.property("nickname", "yuan");
            done();
        })
    })

});


function test_seneca(cb) {
    return Seneca({log: 'test'})
        .test(cb,'print')
        .use(require('../plugins/profile'));
}
