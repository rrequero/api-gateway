const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Microservice = new Schema({
    name: { type: String, required: true, trim: true },
    swagger: Schema.Types.Mixed,
    url: { type: String, required: true, trim: true },
    pathInfo: { type: String, required: true, default: '/info' },
    status: { type: String, default: 'pending' },
    updatedAt: { type: Date, default: Date.now, required: true },
    token: { type: String, required: true, trim: true },
    endpoints: [{
        path: { type: String, required: true, trim: true },
        method: { type: String, required: true, trim: true },
        redirect: {
            path: { type: String, required: true, trim: true },
            method: { type: String, required: true, trim: true },
        },
    }],
});


module.exports = mongoose.model('Microservice', Microservice);
