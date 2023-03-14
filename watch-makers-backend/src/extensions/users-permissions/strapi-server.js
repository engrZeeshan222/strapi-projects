// src/extensions/users-permissions/strapi-server.js

"use strict";

const _ = require("lodash");
const jwt = require("jsonwebtoken");
const utils = require("@strapi/utils");
const bcrypt = require("bcrypt");

const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;

const emailRegExp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel("plugin::users-permissions.user");

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

// validation
const { yup, validateYupSchema } = require("@strapi/utils");
const registerBodySchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const validateRegisterBody = validateYupSchema(registerBodySchema);

module.exports = (plugin) => {
  // JWT issuer
  const issue = (payload, jwtOptions = {}) => {
    _.defaults(jwtOptions, strapi.config.get("plugin.users-permissions.jwt"));
    return jwt.sign(
      _.clone(payload.toJSON ? payload.toJSON() : payload),
      strapi.config.get("plugin.users-permissions.jwtSecret"),
      jwtOptions
    );
  };

  //   Register controller override
  plugin.controllers.auth.register = async (ctx) => {
    console.log("CTX...............", ctx);
    const pluginStore = await strapi.store({
      type: "plugin",

      name: "users-permissions",
    });

    const settings = await pluginStore.get({
      key: "advanced",
    });

    if (!settings.allow_register) {
      throw new ApplicationError("Register action is currently disabled");
    }

    const params = {
      ..._.omit(ctx.request.body, [
        "confirmed",
        "confirmationToken",
        "resetPasswordToken",
      ]),
      provider: "local",
    };

    await validateRegisterBody(params);

    // Throw an error if the password selected by the user
    // contains more than three times the symbol '$'.
    // if (
    //   strapi.service('plugin::users-permissions.user').isHashed(params.password)
    // ) {
    //   throw new ValidationError(
    //     'Your password cannot contain more than three times the symbol `$`'
    //   );
    // }
    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    console.log("ALL ROLES HERE", roles);

    let role = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: params.role } });

    if (!role) {
      role = await strapi
        .query("plugin::users-permissions.role")
        .findOne({ where: { type: settings.default_role } });
    }

    if (!role) {
      throw new ApplicationError("Impossible to find the default role");
    }

    // Check if the provided email is valid or not.
    const isEmail = emailRegExp.test(params.email);

    if (isEmail) {
      params.email = params.email.toLowerCase();
    } else {
      throw new ValidationError("Please provide a valid email address");
    }

    params.role = role.id;
    params.password = await bcrypt.hash(params.password, 12);
    // params.password = await strapi
    //   .service('plugin::users-permissions.user')
    //   .hashPassword(params);

    const user = await strapi.query("plugin::users-permissions.user").findOne({
      where: { email: params.email },
    });

    if (user && user.provider === params.provider) {
      throw new ApplicationError("Email is already taken");
    }

    if (user && user.provider !== params.provider && settings.unique_email) {
      throw new ApplicationError("Email is already taken");
    }

    try {
      if (!settings.email_confirmation) {
        params.confirmed = true;
      }

      const user = await strapi
        .query("plugin::users-permissions.user")
        .create({ data: params });

      const sanitizedUser = await sanitizeUser(user, ctx);
      console.log("user data", user);

      if (settings.email_confirmation) {
        try {
          await strapi
            .service("plugin::users-permissions.user")
            .sendConfirmationEmail(sanitizedUser);
        } catch (err) {
          throw new ApplicationError(err.message);
        }

        return ctx.send({ user: sanitizedUser });
      }

      const jwt = issue(_.pick(user, ["id"]));

      return ctx.send({
        jwt,
        user: sanitizedUser,
        gupta: 1,
      });
    } catch (err) {
      if (_.includes(err.message, "username")) {
        throw new ApplicationError("Username already taken");
      } else {
        throw new ApplicationError("Email already taken");
      }
    }
  };

  plugin.routes["content-api"].routes.unshift({
    method: "POST",
    path: "/auth/local/register",
    handler: "auth.register",
    config: {
      middlewares: ["plugin::users-permissions.rateLimit"],
      prefix: "",
    },
  });

  return plugin;
};
