const Plugin = require('models/plugin');
const logger = require('logger');

module.exports = async function init() {
    logger.info('Initializing migration');
    await Plugin.remove({});
    logger.info('Creating new plugins');
    await new Plugin({
        name: 'manageErrors',
        description: 'Manage Errors',
        mainFile: 'plugins/manageErrors',
        active: true,
    }).save();
    await new Plugin({
        name: 'basicAuth',
        description: 'Add basic authentication',
        mainFile: 'plugins/basicAuth',
        active: false,
    }).save();
    await new Plugin({
        name: 'timeRequest',
        description: 'Show time of the request',
        mainFile: 'plugins/timeRequest',
        active: true,
    }).save();

};
