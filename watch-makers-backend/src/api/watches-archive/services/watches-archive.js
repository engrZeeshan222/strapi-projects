'use strict';

/**
 * watches-archive service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::watches-archive.watches-archive');
