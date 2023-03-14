"use strict";

/**
 * `console` policy.
 */

module.exports = async (ctx, next) => {
  // Add your own logic here.

  console.log(ctx.request.body);

  await next();
};
