const Seneca = require('seneca');
const mongoose = require('mongoose');
const config = require("../../config");
const async = require('async');
const should = require('should');
const Post = require('../../../models/post');


let post = {
    title: "test title",
    description: 'test description',
    content: 'test content  ## yuan'
};

let comment = {
    name: 'Allen',
    email: '876031687@qq.com',
    content: '受教了，这个方法真的有用。'
};

describe('comment_test', () => {

    before(function (done) {
        async.waterfall([
            function (cb) {
                mongoose.connect(config.blog.db_connection, {useNewUrlParser: true}, (err) => {
                    cb(err);
                })
            }, function (cb) {
                new Post(post)
                    .save((err, res) => {
                        if (!err)
                            post = res;
                        cb(err, res);
                    });
            }
        ], (err, res) => {
            done(err, res);
        });
    });

    after(function (done) {
        async.waterfall([
            (cb) => {
                Post.deleteOne({_id: post._id}, cb);
            }
        ], (err, res) => {
            done(err, res);
        })
    });

    it('Add Comment', (done) => {
        const seneca = test_seneca(done);
        seneca
            .act({
                role: 'comment',
                cmd: 'add',
                id: post._id,
                comment: comment
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("name", "Allen");
                res.should.have.property("email", "876031687@qq.com");
                res.should.have.property("content", "受教了，这个方法真的有用。");
                comment = res;
                done();
            })
    });

    it('Query Comment', (done) => {
        const seneca = test_seneca(done);
        seneca
            .act({
                role: 'comment',
                cmd: 'query',
                id: comment._id
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("name", "Allen");
                res.should.have.property("email", "876031687@qq.com");
                res.should.have.property("content", "受教了，这个方法真的有用。");
                done();
            })
    });

    it('List Comment', (done) => {
        const seneca = test_seneca(done);
        seneca
            .act({
                role: 'comment',
                cmd: 'list',
                pageSize: 10,
                pageNum: 1,
                id: post._id
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("pageSize", 10);
                res.should.have.property("pageNum", 1);
                res.list.should.be.an.Array();
                done();
            })
    });

    it('Review Comment', (done) => {
        const seneca = test_seneca(done);
        seneca
            .gate()
            .act({
                role: 'comment',
                cmd: 'update',
                id: comment._id,
                comment: {
                    status: 0//发布
                }
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
            })
            .act({
                role: 'comment',
                cmd: 'query',
                id: comment._id
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property('status', 0);
            })
            .ready(done);
    });

    it('Remove Comment', (done) => {
        const seneca = test_seneca(done);
        seneca.act({
            role: 'comment',
            cmd: 'remove',
            id: comment._id
        }, (err) => {
            should.not.exist(err);
            done();
        })
    });


});

function test_seneca(cb) {
    return Seneca({log: 'test'})
        .test(cb)
        .use(require('../plugins/comment'))
}
