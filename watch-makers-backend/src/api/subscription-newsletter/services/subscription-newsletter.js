'use strict';

/**
 * subscription-newsletter service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::subscription-newsletter.subscription-newsletter');
