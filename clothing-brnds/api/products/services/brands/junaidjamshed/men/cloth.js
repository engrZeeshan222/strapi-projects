const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async scrappingCloths() {
    try {
      let fabricList = await strapi.api.fabric.services.fabric.find();
      let colors = await strapi.api.colors.services.colors.find();
      let sizesList = await strapi.api.sizes.services.sizes.find();
      let brand = await strapi.api.brands.services.brands.findOne({
        name: "junaidjamshed",
      });

      if (!brand) {
        brand = await strapi.api.brands.services.brands.create({
          name: "junaidjamshed",
          link: "https://www.junaidjamshed.com/",
        });
      }
      let link,
        categories,
        linkArray = [];
      let { data } = await axios.get(
        "https://www.junaidjamshed.com/men-collections"
      );
      let selector = cheerio.load(data, { normalizeWhitespace: true });

      //for kurta and kameez shalwar
      categories = selector("body").find(".container-v15 .c-live .col-xs-12");

      selector(categories).each(async (i, ele) => {
        link = selector(ele).find(" > a").attr("href");
        linkArray.push(link);
      });

      //for kurta an waist coat
      categories = selector("body").find(".container-v15 .mg-top-30 .col-sm-6");

      selector(categories).each(async (i, ele) => {
        link = selector(ele).find(".c-live-text__outer > a").attr("href");
        linkArray.push(link);
      });

      categories = selector("body").find(".container-v15 .mg-top-80 .col-sm-4");
      selector(categories).each(async (i, ele) => {
        link = selector(ele).find(".c-live-text__outer > a").attr("href");
        linkArray.push(link);
      });
      //for loop for scraping
      for (let index = 0; index < linkArray.length; index++) {
        if (linkArray[index].split("/")[4] === "kameez-shalwar.html") {
          let type = "stitched";
          await strapi.api.products.services.brands.junaidjamshed.men.scrapping.scrapping(
            type,
            brand,
            linkArray[index],
            colors,
            fabricList,
            sizesList
          );
        }
        if (linkArray[index].split("/")[4] === "kurta.html") {
          let type = "stitched";
          await strapi.api.products.services.brands.junaidjamshed.men.scrapping.scrapping(
            type,
            brand,
            linkArray[index],
            colors,
            fabricList,
            sizesList
          );
        }
        if (linkArray[index].split("/")[4] === "waist-coat.html") {
          let type = "stitched";
          await strapi.api.products.services.brands.junaidjamshed.men.scrapping.scrapping(
            type,
            brand,
            linkArray[index],
            colors,
            fabricList,
            sizesList
          );
        }

        if (linkArray[index].split("/")[4] === "taassur-men-collection.html") {
          let type = "unstitched";
          await strapi.api.products.services.brands.junaidjamshed.men.scrapping.scrapping(
            type,
            brand,
            linkArray[index],
            colors,
            fabricList,
            sizesList
          );
        }
        if (linkArray[index].split("/")[4] === "unstitched.html") {
          let type = "unstitched";
          await strapi.api.products.services.brands.junaidjamshed.men.scrapping.scrapping(
            type,
            brand,
            linkArray[index],
            colors,
            fabricList,
            sizesList
          );
        }
      }
    } catch (err) {
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
};
