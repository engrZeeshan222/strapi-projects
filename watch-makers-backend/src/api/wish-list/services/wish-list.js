"use strict";

/**
 * wish-list service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::wish-list.wish-list",
  ({ strapi }) => ({
    async create(params) {
      console.log(params);

      const res = await strapi.db.query("api::wish-list.wish-list").findOne({
        where: { user: params.data.user, watch: params.data.watch },
      });

      console.log(res);

      if (res) {
        return res;
      }

      const result = await super.create(params);

      return result;
    },
  })
);
