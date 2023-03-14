const Agenda = require("agenda");

module.exports = {
  async agendaNishatlinen() {
    const dbURL = "mongodb://127.0.0.1:27017/mydb";

    const agenda = new Agenda({
      db: {
        address: "mongodb://127.0.0.1/agenda",
        options: { useNewUrlParser: true },
        collection: `agendaJobs-${Math.random()}`, // Start fresh every time
      },
    });

    agenda.define(
      "menNishatlinen",
      {
        lockLifetime: 300 * 1000, // Max amount of time the job should take
        concurrency: 1, // Max number of job instances to run at the same time
      },
      async (job) => {
        console.log("menUnstitched");
        let bool =
          await strapi.api.products.services.brands.nishatlinen.mencloths.scrappingMenCloths();
      }
    );
    agenda.define(
      "womenNishatlinen",
      {
        lockLifetime: 300 * 1000, // Max amount of time the job should take
        concurrency: 1, // Max number of job instances to run at the same time
      },
      async (job) => {
        console.log("unstitched");
        let bool =
          await strapi.api.products.services.brands.nishatlinen.cloths.scrappingCloths();
      }
    );

    // console.log("Agenda is going to start");
    (async function () {
      console.log("Agenda started of Nishatlinen");
      agenda.processEvery("1 second");
      agenda.defaultLockLimit(1);

      await agenda.start();
      await agenda.every("0 05 12 * * *", "womenNishatlinen");
      await agenda.every("0 10 12 * * *", "menNishatlinen");

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
