const Agenda = require("agenda");

module.exports = {
  async agendaJunaidjamshed() {
    const dbURL = "mongodb://127.0.0.1:27017/mydb";

    const agenda = new Agenda({
      db: {
        address: "mongodb://127.0.0.1/agenda",
        options: { useNewUrlParser: true },
        collection: `agendaJobs-${Math.random()}`, // Start fresh every time
      },
    });

    agenda.define(
      "womenJunaidjamshed",
      {
        lockLifetime: 300 * 1000, // Max amount of time the job should take
        concurrency: 1, // Max number of job instances to run at the same time
      },
      async (job) => {
        let bool =
          await strapi.api.products.services.brands.junaidjamshed.women.cloth.scrappingCloths();
      }
    );
    agenda.define(
      "menJunaidjamshed",
      {
        lockLifetime: 300 * 1000, // Max amount of time the job should take
        concurrency: 1, // Max number of job instances to run at the same time
      },
      async (job) => {
        let bool =
          await strapi.api.products.services.brands.junaidjamshed.men.cloth.scrappingCloths();
      }
    );
    agenda.define(
      "kidJunaidjamshed",
      {
        lockLifetime: 300 * 1000, // Max amount of time the job should take
        concurrency: 1, // Max number of job instances to run at the same time
      },
      async (job) => {
        let bool =
          await strapi.api.products.services.brands.junaidjamshed.kids.girls.cloths.scrappingCloths();
      }
    );
    agenda.define(
      "teenJunaidjamshed",
      {
        lockLifetime: 300 * 1000, // Max amount of time the job should take
        concurrency: 1, // Max number of job instances to run at the same time
      },
      async (job) => {
        let bool =
          await strapi.api.products.services.brands.junaidjamshed.kids.teen.cloths.scrappingCloths();
      }
    );

    (async function () {
      console.log("Agenda started of Junaidjamshed");
      agenda.processEvery("1 second");
      await agenda.start();
      await agenda.every("0 00 11 * * *", "womenJunaidjamshed");
      await agenda.every("0 5 11 * * *", "menJunaidjamshed");
      await agenda.every("0 9 11 * * *", "kidJunaidjamshed");
      await agenda.every("0 12 11 * * *", "teenJunaidjamshed");

      agenda.on("start", (job) => {
        console.log(`Job <${job.attrs.name}> starting`);
      });
      agenda.on("success", (job) => {
        console.log(`Job <${job.attrs.name}> succeeded`);
      });
      agenda.on("fail", (error, job) => {
        console.log(`Job <${job.attrs.name}> failed:`, error);
      });
    })();
  },
};
