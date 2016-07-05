const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Microservice = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    swagger: Schema.Types.Mixed,
    url: { type: String, required: true, trim: true },
    pathInfo: { type: String, required: true, default: '/info' },
    status: { type: String, default: 'pending' },
    token: { type: String, required: true, trim: true },
});


module.exports = mongoose.model('Microservice', Microservice);
