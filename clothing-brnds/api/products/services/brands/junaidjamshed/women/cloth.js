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

      let { data } = await axios.get(
        "https://www.junaidjamshed.com/women-collections"
      );
      let selector = cheerio.load(data, { normalizeWhitespace: true });

      let categories = selector("body").find(".container-v15 .col-sm-6");
      let linkArray = [];
      selector(categories).each(async (i, ele) => {
        let link = selector(ele).find(".c-live-text__outer > a").attr("href");
        linkArray.push(link);
        console.log(link.split("/")[4]);
      });

      for (let index = 0; index < linkArray.length; index++) {
        if (linkArray[index].split("/")[4] === "un-stitched.html") {
          let type = "unstitched";
          await strapi.api.products.services.brands.junaidjamshed.women.unstitchedscrapping.unstitchedScrapping(
            type,
            brand,
            linkArray[index],
            colors,
            fabricList,
            sizesList
          );
        } else if (linkArray[index].split("/")[4] === "stitched.html") {
          let type = "stitched";
          await strapi.api.products.services.brands.junaidjamshed.women.unstitchedscrapping.unstitchedScrapping(
            type,
            brand,
            linkArray[index],
            colors,
            fabricList,
            sizesList
          );
        } else if (linkArray[index].split("/")[4] === "kurti.html") {
          let type = "stitched";
          await strapi.api.products.services.brands.junaidjamshed.women.unstitchedscrapping.unstitchedScrapping(
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
      console.log(err.message);
      let obj = {
        brands: brand._id,
        error: err,
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
};
