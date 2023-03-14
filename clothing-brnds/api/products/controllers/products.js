"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async search(ctx) {
    console.log(ctx.query);
    let entities = await strapi.services.products.search(ctx.query);
    return entities;
  },
};
