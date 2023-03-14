"use strict";
const bootstrap = require("./bootstrap");

const _ = require("lodash");
const jwt = require("jsonwebtoken");
const utils = require("@strapi/utils");
const bcrypt = require("bcrypt");

const blurhash = require("./extensions/blurhash");

const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;

const sanitizeUser = (user, context) => {
  const { auth } = context.state;
  const userSchema = strapi.getModel("plugin::users-permissions.user");

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

// JWT issuer
const issue = (payload, jwtOptions = {}) => {
  _.defaults(jwtOptions, strapi.config.get("plugin.users-permissions.jwt"));
  return jwt.sign(
    _.clone(payload.toJSON ? payload.toJSON() : payload),
    strapi.config.get("plugin.users-permissions.jwtSecret"),
    jwtOptions
  );
};

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */

  ///////////////////// NEW CODE WITH NAME END//////////////////////////////////
  register({ strapi }) {
    // blurhash.generatePlaceholder(strapi);
    const extensionService = strapi.service("plugin::graphql.extension");
    extensionService.use(({ strapi }) => ({
      typeDefs: `
        extend input UsersPermissionsRegisterInput {
          username: String!
          email: String!
          password: String!
          role: String
        }

        extend input WishListInput{
          user: ID,
          watch: ID
        }
        extend input CartInput {
          user: ID,
          watch: ID,
          quantity: Int
        }
        extend input ReviewInput{
          review: String,
          rating: Int,
          watch: ID,
          user: ID
        }
        extend input StoreReviewInput{
          review: String,
          rating: Int,
          store: ID,
          user: ID
        }`,

      mutation: `createCart(input CartInput)`,
      mutation: `createWishList(input WishListInput)`,
      mutation: `register(input UsersPermissionsRegisterInput) `,
      mutation: `createReview(input ReviewInput) `,
      mutation: `createStoreReview(input StoreReviewInput) `,
      resolvers: {
        Mutation: {
          createCart: {
            resolve: async (parent, args, context) => {
              const { toEntityResponse } = strapi
                .plugin("graphql")
                .service("format").returnTypes;
              console.log({ parent, args, context });

              let result = await strapi.query("api::cart.cart").findOne({
                where: { user: args.data.user, watch: args.data.watch },
              });
              console.log(result);
              if (result) {
                let quantity = result.quantity + args.data.quantity;
                console.log("Quantity", quantity);
                let data2 = await strapi.query("api::cart.cart").update({
                  where: { id: result.id },
                  data: { quantity },
                });
                console.log("update result", data2);

                return toEntityResponse(data2, { args });
              }

              result = await strapi.query("api::cart.cart").create({
                data: {
                  user: args.data.user,
                  watch: args.data.watch,
                  quantity: args.data.quantity,
                },
              });
              return toEntityResponse(result, { args });
            },
          },
          register: {
            resolve: async (parent, args, context) => {
              console.log({ parent }, { args }, { context });

              console.log("Args Data 123", args);

              const pluginStore = await strapi.store({
                type: "plugin",

                name: "users-permissions",
              });

              const settings = await pluginStore.get({
                key: "advanced",
              });
              console.log("Role Role...", args.input.role);

              if (args.input.role == undefined) {
                let role = await strapi
                  .query("plugin::users-permissions.role")
                  .findOne({ where: { type: settings.default_role } });
                args.input.role = role;
                console.log("ABCDEFGH", role);
              } else {
                console.log("we are in else block", args.input.role);
                let role = await strapi
                  .query("plugin::users-permissions.role")
                  .findOne({ where: { type: args.input.role } });
                console.log("find role", role);
                args.input.role = role;
              }

              const user2 = await strapi
                .query("plugin::users-permissions.user")
                .findOne({
                  where: { email: args.input.email },
                });

              console.log("Already User", user2);
              if (user2 && user2.email == args.input.email) {
                throw new ApplicationError("Email is already taken");
              }

              console.log("Role New Update", args.input.role);
              args.input.password = await bcrypt.hash(args.input.password, 12);
              args.input.provider = args.input.provider || "local";
              args.input.role = args.input.role;
              const user = await strapi
                .query("plugin::users-permissions.user")
                .create({ data: { ...args.input } });

              console.log("User Data Here......", user);

              const sanitizedUser = await sanitizeUser(user, context);
              console.log("user data", sanitizedUser);
              const jwt = issue(_.pick(user, ["id"]));
              console.log("Token.........", jwt);
              const returnData = {
                jwt,
                user: user,
              };

              return returnData;
            },
          },
          createWishList: {
            resolve: async (parent, args, context) => {
              console.log({ parent, args, context });

              console.log("Data......1234", args);

              let res = await strapi.query("api::wish-list.wish-list").findOne({
                where: { user: args.data.user, watch: args.data.watch },
                populate: ["user", "watch"],
              });
              console.log(res);

              if (!res) {
                res = await strapi.query("api::wish-list.wish-list").create({
                  data: {
                    user: args.data.user,
                    watch: args.data.watch,
                  },
                  populate: ["user", "watch"],
                });
              }
              console.log("New....\n", res, "\n New+++++++++++++++");
              console.log(res.id);
              const { toEntityResponse } = strapi
                .plugin("graphql")
                .service("format").returnTypes;

              return toEntityResponse(res, { args });
            },
          },
          createReview: {
            resolve: async (parent, args, context) => {
              console.log({ parent, args, context });

              console.log("Data......1234", args);

              let res = await strapi.query("api::review.review").findOne({
                where: { user: args.data.user, watch: args.data.watch },
                populate: ["user", "watch"],
              });
              console.log("Result Review", res);

              if (!res) {
                res = await strapi.query("api::review.review").create({
                  data: {
                    ...args.data,
                  },
                  populate: ["user", "watch"],
                });
                console.log("created-------", res, "-------created");
              } else {
                let data2 = await strapi.query("api::review.review").update({
                  where: { id: res.id },
                  data: { review: args.data.review, rating: args.data.rating },
                });
              }
              let allReviews = await strapi
                .query("api::review.review")
                .findMany({
                  where: { watch: args.data.watch },
                });

              let averageRating = 0;
              for (let index = 0; index < allReviews.length; index++) {
                averageRating = averageRating + allReviews[index].rating;
              }
              averageRating = averageRating / allReviews.length;
              let watchUpdate = await strapi.query("api::watch.watch").update({
                where: { id: res.watch.id },
                data: { averageRating: averageRating },
              });

              console.log(res.id);
              const { toEntityResponse } = strapi
                .plugin("graphql")
                .service("format").returnTypes;

              return toEntityResponse(res, { args });
            },
          },
          createStoreReview: {
            resolve: async (parent, args, context) => {
              console.log({ parent, args, context });

              console.log("Data......1234", args);

              let res = await strapi
                .query("api::store-review.store-review")
                .findOne({
                  where: { user: args.data.user, store: args.data.store },
                  populate: ["user", "store"],
                });
              console.log(res);

              if (!res) {
                res = await strapi
                  .query("api::store-review.store-review")
                  .create({
                    data: {
                      ...args.data,
                    },
                    populate: ["user", "store"],
                  });
                console.log("created-------", res, "-------created");
              } else {
                let data2 = await strapi
                  .query("api::store-review.store-review")
                  .update({
                    where: { id: res.id },
                    data: {
                      review: args.data.review,
                      rating: args.data.rating,
                    },
                  });
              }
              let allReviews = await strapi
                .query("api::store-review.store-review")
                .findMany({
                  where: { store: args.data.store },
                });

              let averageRating = 0;
              for (let index = 0; index < allReviews.length; index++) {
                averageRating = averageRating + allReviews[index].rating;
              }
              averageRating = averageRating / allReviews.length;
              let storeUpdate = await strapi.query("api::store.store").update({
                where: { id: res.store.id },
                data: { averageRating: averageRating },
              });

              console.log(res.id);
              const { toEntityResponse } = strapi
                .plugin("graphql")
                .service("format").returnTypes;

              return toEntityResponse(res, { args });
            },
          },
        },
      },
    }));
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap,
};
