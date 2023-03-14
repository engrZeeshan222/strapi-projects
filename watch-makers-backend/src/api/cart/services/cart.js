"use strict";

/**
 * cart service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::cart.cart", ({ strapi }) => ({
  async create(params) {
    // some logic here
    console.log(params);

    const res = await strapi.db.query("api::cart.cart").findOne({
      where: { user: params.data.user, watch: params.data.watch },
    });

    console.log(res);

    if (res) {
      const res2 = await strapi.db.query("api::cart.cart").update({
        where: { id: res.id },
        data: {
          quantity: params.data.quantity,
        },
      });
      console.log("Updated Data", res2);
      return res2;
    }

    const result = await super.create(params);
    // some more logic

    return result;
  },
}));
