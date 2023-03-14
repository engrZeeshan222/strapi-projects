const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async unstitchedJob() {
    try {
      console.log("in unstitched");
      let fabricList = await strapi.api.fabric.services.fabric.find();
      let colors = await strapi.api.colors.services.colors.find();
      let brand = await strapi.api.brands.services.brands.findOne({
        name: "limelight",
      });

      selector(classifications).each(async (i, element) => {
        let link = selector(element).find(".dlinks").attr("href");
        let name = selector(element).find(".dlinks").text().trim();

        let classification = await strapi.services.classification.findOne({
          link: link,
          brand: brand._id,
        });
        if (!classification) {
          classification = await strapi.services.classification.create({
            title: name,
            link: link,
            brand: brand._id,
          });
        }
      });
      if (!brand) {
        brand = await strapi.api.brands.services.brands.create({
          name: "limelight",
          link: "https://www.limelight.pk",
        });
      }

      let classification = await strapi.services.classification.findOne({
        link: "https://limelightpk.myshopify.com/pages/unstitched",
        brand: brand._id,
      });

      if (
        classification.link ===
        "https://limelightpk.myshopify.com/pages/unstitched"
      ) {
        await strapi.api.products.services.brands.limelight.women.unstitched.scrapping(
          brand,
          colors,
          fabricList,
          classification
        );
      }

      return true;
    } catch (err) {
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },

  async readyToWearJob() {
    try {
      console.log("in readyToWear");
      let fabricList = await strapi.api.fabric.services.fabric.find();
      let colors = await strapi.api.colors.services.colors.find();
      let sizesList = await strapi.api.sizes.services.sizes.find();
      let brand = await strapi.api.brands.services.brands.findOne({
        name: "limelight",
      });

      if (!brand) {
        brand = await strapi.api.brands.services.brands.create({
          name: "limelight",
          link: "https://www.limelight.pk",
        });
      }
      let classification = await strapi.services.classification.findOne({
        link: "https://www.limelight.pk/pages/ready-to-wear",
        brand: brand._id,
      });

      if (
        classification.link === "https://www.limelight.pk/pages/ready-to-wear"
      ) {
        await strapi.api.products.services.brands.limelight.women.readytowear.scrapping(
          brand,
          colors,
          fabricList,
          sizesList,
          classification
        );
      }

      return true;
    } catch (err) {
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },

  async westernJob() {
    try {
      console.log("in readyToWear");
      let fabricList = await strapi.api.fabric.services.fabric.find();
      let colors = await strapi.api.colors.services.colors.find();
      let sizesList = await strapi.api.sizes.services.sizes.find();
      let brand = await strapi.api.brands.services.brands.findOne({
        name: "limelight",
      });

      if (!brand) {
        brand = await strapi.api.brands.services.brands.create({
          name: "limelight",
          link: "https://www.limelight.pk",
        });
      }
      let classification = await strapi.services.classification.findOne({
        link: "https://limelightpk.myshopify.com/pages/western",
        brand: brand._id,
      });

      if (
        classification.link ===
        "https://limelightpk.myshopify.com/pages/western"
      ) {
        await strapi.api.products.services.brands.limelight.women.westren.scrapping(
          brand,
          colors,
          fabricList,
          sizesList,
          classification
        );
      }

      return true;
    } catch (err) {
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
      s;
    }
  },
  async bottomJob() {
    try {
      console.log("in readyToWear");
      let fabricList = await strapi.api.fabric.services.fabric.find();
      let colors = await strapi.api.colors.services.colors.find();
      let sizesList = await strapi.api.sizes.services.sizes.find();
      let brand = await strapi.api.brands.services.brands.findOne({
        name: "limelight",
      });

      if (!brand) {
        brand = await strapi.api.brands.services.brands.create({
          name: "limelight",
          link: "https://www.limelight.pk",
        });
      }
      let classification = await strapi.services.classification.findOne({
        link: "https://limelightpk.myshopify.com/pages/bottoms",
        brand: brand._id,
      });

      if (
        classification.link ===
        "https://limelightpk.myshopify.com/pages/bottoms"
      ) {
        await strapi.api.products.services.brands.limelight.women.bottoms.scrapping(
          brand,
          colors,
          fabricList,
          sizesList,
          classification
        );
      }

      return true;
    } catch (err) {
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
  async otherClothsJob() {
    try {
      console.log("in readyToWear");
      let fabricList = await strapi.api.fabric.services.fabric.find();
      let colors = await strapi.api.colors.services.colors.find();
      let sizesList = await strapi.api.sizes.services.sizes.find();
      let brand = await strapi.api.brands.services.brands.findOne({
        name: "limelight",
      });

      if (!brand) {
        brand = await strapi.api.brands.services.brands.create({
          name: "limelight",
          link: "https://www.limelight.pk",
        });
      }
      let classification = await strapi.services.classification.findOne({
        link: "/pages/girl",
        brand: brand._id,
      });

      if (classification.link === "/pages/girl") {
        await strapi.api.products.services.brands.limelight.women.girl.scrapping(
          brand,
          colors,
          fabricList,
          sizesList,
          classification
        );
      }
      classification = await strapi.services.classification.findOne({
        link: "/pages/men",
        brand: brand._id,
      });
      if (classification.link === "/pages/men") {
        await strapi.api.products.services.brands.limelight.men.scrapping(
          brand,
          colors,
          fabricList,
          sizesList,
          classification
        );
      }
      classification = await strapi.services.classification.findOne({
        link: "https://limelightpk.myshopify.com/pages/scarves",
        brand: brand._id,
      });
      if (
        classification.link ===
        "https://limelightpk.myshopify.com/pages/scarves"
      ) {
        await strapi.api.products.services.brands.limelight.women.scarves.scrapping(
          brand,
          colors,
          fabricList,
          classification
        );
      }
      return true;
    } catch (err) {
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
};
