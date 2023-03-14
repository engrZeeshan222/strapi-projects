"use strict";
var moment = require("moment"); // require
const Agenda = require("agenda");

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = async () => {
  await strapi.api.products.services.brands.limelight.agenda.agendaLimelight();
  await strapi.api.products.services.brands.nishatlinen.agenda.agendaNishatlinen();
  await strapi.api.products.services.brands.junaidjamshed.agenda.agendaJunaidjamshed();
};
