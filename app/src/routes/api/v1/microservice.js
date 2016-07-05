const Router = require('koa-router');
const MicroserviceModel = require('models/microservice');
const logger = require('logger');
const MicroserviceService = require('services/microservice');
const MicroserviceDuplicated = require('errors/microserviceDuplicated');
const MicroserviceNotExist = require('errors/microserviceNotExist');

const router = new Router({
    prefix: '/microservice',
});

class MicroserviceRouter {

    static async get(ctx) {
        logger.info('Obtaining microservices registered');
        ctx.body = await MicroserviceModel.find({}, { __v: 0 });
    }

    static async register(ctx) {
        logger.info(`Registering microservice`);
        try {
            const result = await MicroserviceService.register(ctx.request.body);
            ctx.body = result;
        } catch (err) {
            if (err instanceof MicroserviceDuplicated) {
                ctx.throw(400, err.message);
                return;
            }
            throw err;
        }
    }

    static async delete(ctx) {
        logger.info(`Removing microservice with slug ${ctx.params.slug}`);
        try {
            const result = await MicroserviceService.remove(ctx.params.slug);
            ctx.body = result;
        } catch (err) {
            if (err instanceof MicroserviceNotExist) {
                ctx.throw(404, err.message);
                return;
            }
            throw err;
        }
    }

}

router.get('/', MicroserviceRouter.get);
router.post('/', MicroserviceRouter.register);
router.delete('/:slug', MicroserviceRouter.delete);

module.exports = router;
