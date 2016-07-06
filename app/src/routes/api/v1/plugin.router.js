const Router = require('koa-router');
const Plugin = require('models/plugin.model');
const logger = require('logger');

const router = new Router({
    prefix: '/plugin',
});

class PluginRouter {

    static async get(ctx) {
        logger.info('Obtaining plugins');
        ctx.body = await Plugin.find({}, { __v: 0 });
    }

    static async update(ctx) {
        logger.info(`Update plugin with id ${ctx.params.id}`);
        const plugin = await Plugin.findById(ctx.params.id, { __v: 0 });
        if (!plugin) {
            ctx.throw(404, 'Plugin not found');
            return;
        }
        plugin.active = ctx.request.body.active;
        await plugin.save();
        logger.debug('Plugin updated successfully');
        ctx.body = plugin;
    }

}

router.get('/', PluginRouter.get);
router.patch('/:id', PluginRouter.update);

module.exports = router;
