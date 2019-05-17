module.exports = [
    {
        method: 'GET',
        path: '/',
        handler: async (request, h) => {
            console.log(request.yar.id);
            return request.yar.get('user');
        },
        config: {
            // auth: false
        }
    }
];
