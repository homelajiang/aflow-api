const Seneca = require('seneca');
const mongoose = require('mongoose');
const config = require('../../config');
const async = require('async');
const should = require('should');

let file = {
    name: 'test_file',
    path: "/20181022",
    description: 'test_description',
    mimetype: "jpg"
};

describe('image_hosting', () => {

    before(function (done) {
        async.waterfall([
            function (cb) {
                mongoose.connect(config.image_hosting.db_connection, {useNewUrlParser: true}, (err) => {
                    cb(err);
                })
            }
        ], (err, res) => {
            done(err, res);
        });
    });

    it('Add File', (done) => {
        const seneca = test_seneca(done);
        seneca.act({
            role: 'file',
            cmd: 'add',
            file: file
        }, (err, res) => {
            should.not.exist(err);
            should.exist(res);
            res.should.have.property("name", "test_file");
            file = res;
            done();
        })
    });

    it('Query File', (done) => {
        const seneca = test_seneca(done);
        seneca.act({
            role: 'file',
            cmd: 'query',
            id: file._id
        }, (err, res) => {
            should.not.exist(err);
            should.exist(res);
            res.should.have.property("name", "test_file");
            file = res;
            done();
        })
    });

    it('List File', (done) => {
        const seneca = test_seneca(done);
        seneca
            .gate()
            .act({
                role: 'file',
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
                role: 'file',
                cmd: 'list',
                pageSize: 10,
                pageNum: 1,
                key: 'test'
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("pageSize", 10);
                res.should.have.property("pageNum", 1);
                res.list.should.be.an.Array();
            })
            .ready(done);
    });

    it('Update File', (done) => {
        const seneca = test_seneca(done);
        seneca
            .gate()
            .act({
                role: 'file',
                cmd: 'update',
                id: file._id,
                file: {
                    name: 'test',
                    description: 'test'
                }
            }, (err) => {
                should.not.exist(err);
            })
            .act({
                role: 'file',
                cmd: 'query',
                id: file._id
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("name", "test");
                res.should.have.property("description", "test");
            })
            .ready(done);
    });

    it('Remove File', (done) => {
        const seneca = test_seneca(done);
        seneca.act({
            role: 'file',
            cmd: 'remove',
            id: file._id
        }, (err) => {
            should.not.exist(err);
            done();
        });
    });

});


function test_seneca(cb) {
    return Seneca({log: 'test'})
        .test(cb, 'print')
        .use(require('../plugins/image_hosting'))
}
