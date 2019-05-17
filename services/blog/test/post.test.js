const Seneca = require('seneca');
const mongoose = require('mongoose');
const config = require("../../config");
const async = require('async');
const should = require('should');
const Post = require('../../../models/post');

let test_post = {
    title: "test title",
    description: 'test description',
    content: 'test content  ## yuan'
};

describe('post_test', () => {

    before((done) => {
        async.waterfall([
            function (cb) {
                mongoose.connect(config.blog.db_connection, {useNewUrlParser: true}, (err) => {
                    cb(err);
                })
            }
        ], (err, res) => {
            done(err, res);
        });
    });

    it('Add Post', (done) => {
        const seneca = test_seneca(done);
        seneca.act({
            role: 'post',
            cmd: 'add',
            post: test_post
        }, (err, res) => {
            should.not.exist(err);
            should.exist(res);
            res.should.have.property("title", "test title");
            res.should.have.property("description", "test description");
            res.should.have.property("content", "test content  ## yuan");
            test_post = res;
            done();
        });

    });

    it('Query Post', (done) => {
        const seneca = test_seneca(done);
        seneca.act({
            role: 'post',
            cmd: 'query',
            id: test_post._id
        }, (err, res) => {
            should.not.exist(err);
            should.exist(res);
            res.should.have.property("title", "test title");
            res.should.have.property("description", "test description");
            res.should.have.property("content", "test content  ## yuan");
            done();
        });
    });

    it('List Post', (done) => {
        const seneca = test_seneca(done);
        seneca
            .gate()
            .act({
                role: 'post',
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
                role: 'post',
                cmd: 'list',
                pageSize: 10,
                pageNum: 1,
                key: 'title'
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("pageSize", 10);
                res.should.have.property("pageNum", 1);
                res.list.should.be.an.Array();
            })
            .ready(done);
    });

    it('Update Post', (done) => {
        const seneca = test_seneca(done);
        seneca
            .gate()
            .act({
                role: 'post',
                cmd: 'update',
                id: test_post._id,
                post: {
                    title: 'test',
                    description: 'test',
                    content: 'test'
                }
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
            })
            .act({
                role: 'post',
                cmd: 'query',
                id: test_post._id
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("title", 'test');
                res.should.have.property("description", 'test');
                res.should.have.property("content", 'test');
            })
            .ready(done);
    });

    it('Mark Delete Post', (done) => {
        const seneca = test_seneca(done);
        seneca
            .gate()
            .act({
                role: 'post',
                cmd: 'delete',
                id: test_post._id,
                delete_reason: "delete_reason"
            }, (err) => {
                should.not.exist(err);
            })
            .act({
                role: 'post',
                cmd: 'query',
                id: test_post._id
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                should.exist(res.delete_reason);
                res.should.have.property("status", -1);
            })
            .ready(done);
    });

    it('Remove Post', (done) => {
        const seneca = test_seneca(done);
        seneca.act({
            role: 'post',
            cmd: 'remove',
            id: test_post._id
        }, (err) => {
            should.not.exist(err);
            done();
        });
    });
});

function test_seneca(cb) {
    return Seneca({log: 'test'})
        .test(cb)
        .use(require('../plugins/post'))
}
