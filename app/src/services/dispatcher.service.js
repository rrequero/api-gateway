const logger = require('logger');
const EndpointModel = require('models/endpoint.model');
const url = require('url');
const EndpointNotFound = require('errors/endpointNotFound');
const pathToRegexp = require('path-to-regexp');
const restling = require('restling');

class Dispatcher {

    static async buildUrl(sourcePath, redirectEndpoint, endpoint) {
        logger.debug('Building url');
        const result = endpoint.pathRegex.exec(sourcePath);
        let keys = {}; // eslint-disable-line prefer-const
        endpoint.pathKeys.map((key, i) => (
            keys[key] = result[i + 1]
        ));
        const toPath = pathToRegexp.compile(redirectEndpoint.path);
        const buildUrl = url.resolve(redirectEndpoint.url, toPath(keys));
        logger.debug(`Final url  ${buildUrl}`);
        return buildUrl;
    }

    static async getRequests(ctx) {
        logger.info(`Searching endpoint where redirect url ${ctx.request.url}
            and method ${ctx.request.method}`);
        const parsedUrl = url.parse(ctx.request.url);
        logger.debug('Searching endpoints');
        const endpoint = await EndpointModel.findOne({
            $where: `this.pathRegex && this.pathRegex.test('${parsedUrl.pathname}')`,
            method: ctx.request.method,
        });

        if (!endpoint) {
            throw new EndpointNotFound(`${parsedUrl.pathname} not found`);
        } else {
            logger.debug('Endpoint found');
            let redirectEndpoint = null;
            if (endpoint.redirect && endpoint.redirect.length > 1) {
                logger.debug(`Find several redirect endpoints (num: ${endpoint.redirect.length}).
                Obtaining final endpoint with random`);
                const pos = Math.floor(Math.random() * endpoint.redirect.length);
                logger.debug(`Position choose ${pos}`);
                redirectEndpoint = endpoint.redirect[pos];
            } else {
                logger.debug('Only contain one redirect');
                redirectEndpoint = endpoint.redirect[0];
            }
            logger.info('Dispathing request from %s to %s%s private endpoint.',
                parsedUrl.pathname, redirectEndpoint.url, redirectEndpoint.path);

            const finalUrl = await Dispatcher.buildUrl(parsedUrl.pathname, redirectEndpoint, endpoint);
            let configRequest = { // eslint-disable-line prefer-const
                uri: finalUrl,
                method: redirectEndpoint.method,
            };
            if (ctx.request.search) {
                logger.debug('Adding query params');
                configRequest.uri = `${configRequest.uri}${ctx.request.search}`;
            }

            logger.debug('Create request to %s', configRequest.uri);
            if (configRequest.method === 'POST' || configRequest.method === 'PATCH' ||
                configRequest.method === 'PUT') {
                logger.debug('Method is %s. Adding body', configRequest.method);
                configRequest.data = ctx.request.body;
            }
            if (ctx.request.body.files) {
                logger.debug('Adding files');
                const files = ctx.request.body.files;
                let formData = {}; // eslint-disable-line prefer-const
                for (const key in files) { // eslint-disable-line no-restricted-syntax
                    if ({}.hasOwnProperty.call(files, key)) {
                        formData[key] = restling.file(files[key].path);
                    }
                }
                configRequest.data = Object.assign(configRequest.data || {}, formData);
                configRequest.multipart = true;
            }
            if (ctx.request.headers) {
                logger.debug('Adding headers');
                configRequest.headers = ctx.request.headers;
            }
            logger.debug('Returning config', configRequest);
            return configRequest;
        }
    }

}

module.exports = Dispatcher;
