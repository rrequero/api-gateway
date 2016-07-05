const mongoose = require('mongoose');
require('mongoose-regexp')(mongoose);
const Schema = mongoose.Schema;

const Endpoint = new Schema({
    path: { type: String, required: true, trim: true },
    owner: { type: String, required: true, trim: true },
    method: { type: String, required: true, trim: true },
    urlRegex: { type: RegExp, required: true },
    keys: [{ type: String, trim: true }],
    authenticated: { type: Boolean, default: false },
    redirect: [{
        path: { type: String, required: true, trim: true },
        host: { type: String, required: true, trim: true },
        method: { type: String, required: true, trim: true },
    }],
});

module.exports = mongoose.model('Endpoint', Endpoint);
