const koaCtxBasicAuth = require('koa-ctx-basic-auth');
const logger = require('logger');

function init() {

}

function middleware(app) {
    logger.info('Init basic auth');
    koaCtxBasicAuth(app);
    app.use(async(ctx, next) => {
        try {
            await next();
        } catch (err) {
            if (err.status === 401) {
                ctx.status = 401;
                ctx.set('WWW-Authenticate', 'Basic');
                ctx.body = 'Not authorized';
            } else {
                throw err;
            }
        }
    });

    app.use(async(ctx, next) => {
        if (ctx.basicAuth) {
            const {
                name,
                pass,
            } = ctx.basicAuth;
            if (name === 'Ra' && pass === 'ra') {
                await next();
            } else {
                ctx.throw(401, 'Invalid credentials');
            }
        } else {
            ctx.throw(401, 'Invalid credentials');
        }
    });
}


module.exports = {
    middleware,
    init,
};
