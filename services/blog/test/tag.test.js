const Seneca = require('seneca');
const mongoose = require('mongoose');
const config = require("../../config");
const async = require('async');
const should = require('should');
const Tag = require('../../../models/tag');


let test_tag = {
    name: 'Seneca',
    alias: 'seneca',
    image: 'http://senecajs.org/images/logo-seneca.svg',
    description: 'Seneca is a microservices toolkit for Node.js. '
};


describe('tag_test', () => {

    before(function (done) {
        async.waterfall([
            function (cb) {
                mongoose.connect(config.blog.db_connection, {useNewUrlParser: true}, (err) => {
                    cb(err);
                })
            },
            function (cb) {
                Tag.deleteMany({name: test_tag.name}, cb);
            }
        ], (err, res) => {
            done(err, res);
        });
    });

    it('Add Tag', (done) => {
        const seneca = test_seneca(done);
        seneca
            .act({
                role: 'tag',
                cmd: 'add',
                tag: test_tag
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("name", "Seneca");
                test_tag = res;
                done();
            });
    });

    it('Query Tag', (done) => {
        const seneca = test_seneca(done);
        seneca
            .act({
                role: 'tag',
                cmd: 'query',
                id: test_tag._id
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("name", "Seneca");
                done();
            });
    });

    it('List Tag', (done) => {
        const seneca = test_seneca(done);
        seneca
            .gate()
            .act({
                role: 'tag',
                cmd: 'list',
                pageSize: 10,
                pageNum: 1
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("pageSize", 10);
                res.should.have.property("pageNum", 1);
                res.list.should.be.an.Array();
            })
            .act({
                role: 'tag',
                cmd: 'list',
                pageSize: 10,
                pageNum: 1,
                key: 'Android'
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("pageSize", 10);
                res.should.have.property("pageNum", 1);
                res.list.should.be.an.Array();
            })
            .ready(done);
    });

    it('Update Tag', (done) => {
        const seneca = test_seneca(done);

        seneca
            .gate()
            .act({
                role: 'tag',
                cmd: 'update',
                id: test_tag._id,
                tag: {
                    alias: 'seneca_test',
                    image: 'test',
                    description: 'test'
                }
            }, (err) => {
                should.not.exist(err);
            })
            .act({
                role: 'tag',
                cmd: 'query',
                id: test_tag._id
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("name", "Seneca");
                res.should.have.property("alias", "seneca_test");
                res.should.have.property("image", "test");
                res.should.have.property("description", "test");
            })
            .ready(done);
    });

    it('Remove Tag', (done) => {
        const seneca = test_seneca(done);
        seneca.act({
            role: 'tag',
            cmd: 'remove',
            id: test_tag._id
        }, (err) => {
            should.not.exist(err);
            done();
        });
    });

});


function test_seneca(cb) {
    return Seneca({log: 'test'})
        .test(cb,'print')
        .use(require('../plugins/tag'))
}
