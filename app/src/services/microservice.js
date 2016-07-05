const logger = require('logger');
const MicroserviceModel = require('models/microservice');
const MicroserviceDuplicated = require('errors/microserviceDuplicated');
const MicroserviceNotExist = require('errors/microserviceNotExist');
const request = require('request-promise');
const url = require('url');
const crypto = require('crypto');

const slug = require('slug');
slug.defaults.modes.pretty = {
    replacement: '_',
    symbols: true,
    remove: /[.]/g,
    lower: false,
    charmap: slug.charmap,
    multicharmap: slug.multicharmap,
};

const MICRO_STATUS_PENDING = 'pending';
const MICRO_STATUS_ACTIVE = 'active';
const MICRO_STATUS_DEACTIVATED = 'deactivated';
const MICRO_STATUS_ERROR = 'error';

class Microservice {

    static async getInfoMicroservice(micro) {
        logger.info(`Obtaining info of the microservice with name ${micro.name}`);
        const urlInfo = url.resolve(micro.url, micro.pathInfo);
        logger.debug(`Doing request to ${urlInfo}`);
        let result = null;
        try {
            result = await request(urlInfo);
            logger.debug('result', result);
            return true;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    static async register(info) {
        logger.info(`Registering new microservice with name ${info.name}`);
        logger.debug('Search if exist');
        const exist = await MicroserviceModel.findOne({
            slug: slug(info.name),
        });
        if (exist) {
            throw new MicroserviceDuplicated(`Microservice with ${info.name} exists`);
        }
        logger.debug(`Creating microservice with status ${MICRO_STATUS_PENDING}`);

        const micro = await new MicroserviceModel({
            name: info.name,
            slug: slug(info.name),
            status: MICRO_STATUS_PENDING,
            url: info.url,
            pathInfo: info.pathInfo,
            swagger: info.swagger,
            token: crypto.randomBytes(20).toString('hex'),
        }).save();

        logger.debug('Saved correct');
        const correct = await Microservice.getInfoMicroservice(micro);
        if (correct) {
            logger.info(`Updating state of microservice with name ${micro.name}`);
            micro.status = MICRO_STATUS_ACTIVE;
            await micro.save();
            logger.info('Updated successfully');
        } else {
            logger.info(`Updated to error state microservice with name ${micro.name}`);
            micro.status = MICRO_STATUS_ERROR;
            await micro.save();
        }

        return micro;
    }

    static async remove(slug) {
        logger.info(`Removing microservice with slug ${slug}`);
        const micro = await MicroserviceModel.findOne({ slug }, { __v: 0 });
        if (!micro) {
            throw new MicroserviceNotExist(`Microservice with name ${name} does not exist`);
        }
        await micro.remove();
        return micro;
    }

}

module.exports = Microservice;
