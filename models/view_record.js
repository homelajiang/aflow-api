const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const viewRecordSchema = new Schema({
    user: String,
    ip: String,
    path: String,
    language: String,
    browser: String,
    date: {type: Date, default: Date.now},
    post: {type: Schema.Types.ObjectId, ref: 'Post'}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});


const ViewRecord = mongoose.model('ViewRecord', viewRecordSchema);

module.exports = ViewRecord;
