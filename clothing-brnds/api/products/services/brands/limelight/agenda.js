const Agenda = require("agenda");

module.exports = {
  async agendaLimelight() {
    const dbURL = "mongodb://127.0.0.1:27017/mydb";

    const agenda = new Agenda({
      db: {
        address: "mongodb://127.0.0.1/agenda",
        options: { useNewUrlParser: true },
        collection: `agendaJobs-${Math.random()}`, // Start fresh every time
      },
    });

    agenda.define(
      "unstitchedLimelight",
      {
        lockLifetime: 300 * 1000, // Max amount of time the job should take
        concurrency: 1, // Max number of job instances to run at the same time
      },
      async (job) => {
        console.log("unstitched");
        let bool =
          await strapi.api.products.services.brands.limelight.cronjob.unstitchedJob();
      }
    );

    agenda.define(
      "readyToWearLimelight",
      {
        lockLifetime: 300 * 1000, // Max amount of time the job should take
        concurrency: 1, // Max number of job instances to run at the same time
      },
      async (job) => {
        console.log("ReadyToWear");
        let bool =
          await strapi.api.products.services.brands.limelight.cronjob.readyToWearJob();
      }
    );
    agenda.define(
      "westernLimelight",
      {
        lockLifetime: 300 * 1000, // Max amount of time the job should take
        concurrency: 1, // Max number of job instances to run at the same time
      },
      async (job) => {
        console.log("westernWear");
        let bool =
          await strapi.api.products.services.brands.limelight.cronjob.westernJob();
      }
    );

    agenda.define(
      "bottomLimelight",
      {
        lockLifetime: 300 * 1000, // Max amount of time the job should take
        concurrency: 1, // Max number of job instances to run at the same time
      },
      async (job) => {
        console.log("bottom");
        let bool =
          await strapi.api.products.services.brands.limelight.cronjob.bottomJob();
      }
    );
    agenda.define(
      "otherClothsLimelight",
      {
        lockLifetime: 300 * 1000, // Max amount of time the job should take
        concurrency: 1, // Max number of job instances to run at the same time
      },
      async (job) => {
        console.log("otherClothsLimelight");
        let bool =
          await strapi.api.products.services.brands.limelight.cronjob.otherClothsJob();
      }
    );

    // console.log("Agenda is going to start");
    (async function () {
      console.log("Agenda started of Limelight");
      agenda.processEvery("1 second");
      await agenda.start();
      await agenda.every("0 30 11 * * *", "unstitchedLimelight");
      await agenda.every("0 35 11 * * *", "readyToWearLimelight");
      await agenda.every("0 40 11 * * *", "westernLimelight");
      await agenda.every("0 44 11 * * *", "bottomLimelight");
      await agenda.every("0 48 11 * * *", "otherClothsLimelight");

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
