const cors = require('kcors');

function init() {

}

function middleware(app) {
    app.use(cors());
}


module.exports = {
    middleware,
    init,
};
