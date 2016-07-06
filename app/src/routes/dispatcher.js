const Router = require('koa-router');
const logger = require('logger');
const DispatcherService = require('services/dispatcher.service.js');
const EndpointNotFound = require('errors/endpointNotFound');
const NotAuthorized = require('errors/notAuthorized');
const fs = require('fs');
const router = new Router();
const Promise = require('bluebird');
const restling = require('restling');

const unlink = async(file) =>
    new Promise((resolve, reject) => {
        fs.unlink(file, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });


class DispatcherRouter {

    static async dispatch(ctx) {
        logger.info(`Dispatch url ${ctx.request.url} and method ${ctx.request.method}`);
        try {
            logger.debug('Obtaining config request');
            const configRequest = await DispatcherService.getRequests(ctx);
            logger.debug('Config request', configRequest);
            logger.debug('Sending request');
            const result = await restling.request(configRequest.uri, configRequest);
            // ctx.set(getHeadersFromResponse(result.response));
            ctx.status = result.response.statusCode;
            ctx.body = result.data;
            ctx.response.type = result.response.headers['content-type'];
        } catch (err) {
            logger.error(err);
            if (err instanceof EndpointNotFound) {
                logger.debug('Endpoint not found');
                ctx.throw(404, 'Endpoint not found');
                return;
            }
            if (err instanceof NotAuthorized) {
                logger.debug('Not authorized');
                ctx.throw(401, err.message);
                return;
            }
            if (err.errors && err.errors.length > 0 && err.errors[0].status >= 400 && err.errors[0].status < 500) {
                ctx.status = err.errors[0].status;
                ctx.body = err;
            } else {
                if (process.env.NODE_ENV === 'prod') {
                    ctx.throw(500, 'Unexpected error');
                    return;
                }
                let message = '';
                if (err.message) {
                    message += err.message;
                }
                if (err.exception) {
                    message += ` --- ${err.exception}`;
                }
                ctx.throw(500, message);
                return;
            }

        } finally {
            if (ctx.request.body.files) {
                logger.debug('Removing files');
                const files = Object.keys(ctx.request.body.files);
                for (let i = 0, length = files.length; i < length; i++) {
                    logger.debug('Removing file  %s', ctx.request.body.files[files[i]].path);
                    await unlink(ctx.request.body.files[files[i]].path);
                }
            }
        }

    }

}

router.get('/*', DispatcherRouter.dispatch);
router.post('/*', DispatcherRouter.dispatch);
router.delete('/*', DispatcherRouter.dispatch);
router.put('/*', DispatcherRouter.dispatch);
router.patch('/*', DispatcherRouter.dispatch);

module.exports = router;
