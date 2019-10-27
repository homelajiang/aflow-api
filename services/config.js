module.exports = {
    image_hosting: {
        port: 5201,
        db_connection: "mongodb://localhost:27017/aflow",
        base_url: 'http://localhost:8000/'
    },
    blog: {
        port: 5202,
        db_connection: "mongodb://localhost:27017/aflow",
        base_url: 'http://localhost:8000/'
    },
    spider: {
        port: 5203,
        db_connection: "mongodb://localhost:27017/aflow",
        base_url: 'http://localhost:8000/'
    },
    auth: {
        port: 5204,
        db_connection: 'mongodb://localhost:27017/aflow',
        base_url: 'http://localhost:8000/'
    },
    feed: {
        port: 5205,
        db_connection: 'mongodb://localhost:27017/aflow',
        base_url: 'http://localhost:8000/'
    },
    statistics: {
        port: 5206,
        db_connection: "mongodb://localhost:27017/aflow",
        base_url: 'http://localhost:8000/'
    },
};
