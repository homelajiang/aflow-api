const Seneca = require('seneca');
const mongoose = require('mongoose');
const config = require("../../config");
const async = require('async');
const should = require('should');
const Categories = require('../../../models/categories');


let test_categories = {
    name: 'Seneca',
    alias: 'seneca',
    image: 'http://senecajs.org/images/logo-seneca.svg',
    description: 'Seneca is a microservices toolkit for Node.js. '
};


describe('categories_test', () => {

    before(function (done) {
        async.waterfall([
            function (cb) {
                mongoose.connect(config.blog.db_connection, {useNewUrlParser: true}, (err) => {
                    cb(err);
                })
            },
            function (cb) {
                Categories.deleteMany({name: test_categories.name}, cb);
            }
        ], (err, res) => {
            done(err, res);
        });
    });

    it('Add Categories', (done) => {
        const seneca = test_seneca(done);
        seneca
            .act({
                role: 'categories',
                cmd: 'add',
                categories: test_categories
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("name", "Seneca");
                test_categories = res;
                done();
            });
    });

    it('Query Categories', (done) => {
        const seneca = test_seneca(done);
        seneca
            .act({
                role: 'categories',
                cmd: 'query',
                id: test_categories._id
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("name", "Seneca");
                done();
            });
    });

    it('List Categories', (done) => {
        const seneca = test_seneca(done);
        seneca
            .gate()
            .act({
                role: 'categories',
                cmd: 'list',
                pageSize: 10,
                pageNum: 1
            }, (err, res) => {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property("pageSize", 10);
                res.should.have.property("pageNum", 1);
            })
            .act({
                role: 'categories',
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

    it('Update Categories', (done) => {
        const seneca = test_seneca(done);

        seneca
            .gate()
            .act({
                role: 'categories',
                cmd: 'update',
                id: test_categories._id,
                categories: {
                    alias: 'seneca_test',
                    image: 'test',
                    description: 'test'
                }
            }, (err) => {
                should.not.exist(err);
            })
            .act({
                role: 'categories',
                cmd: 'query',
                id: test_categories._id
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

    it('Remove Categories', (done) => {
        const seneca = test_seneca(done);
        seneca.act({
            role: 'categories',
            cmd: 'remove',
            id: test_categories._id
        }, (err) => {
            should.not.exist(err);
            done();
        });
    });

});


function test_seneca(cb) {
    return Seneca({log: 'test'})
        .test(cb,'print')
        .use(require('../plugins/categories'))
}
