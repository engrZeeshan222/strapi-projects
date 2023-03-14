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
        "https://www.junaidjamshed.com/boys-girls-collection"
      );
      let selector = cheerio.load(data, { normalizeWhitespace: true });

      //for kurta and kameez shalwar
      categories = selector("body").find(
        ".container-v15 .c-live .mg-top-30 .col-sm-6"
      );

      selector(categories).each(async (i, ele) => {
        link = selector(ele).find(".c-live-text__outer > a").attr("href");
        linkArray.push(link);
      });

      for (let index = 0; index < linkArray.length; index++) {
        if (linkArray[index].split("/")[4] === "teen-girls.html") {
          let type = "stitched";
          let category = "girl";
          await strapi.api.products.services.brands.junaidjamshed.kids.girls.scrapping.scrapping(
            category,
            type,
            brand,
            linkArray[index],
            colors,
            fabricList,
            sizesList
          );
        }

        if (linkArray[index].split("/")[4] === "teen-boys.html") {
          let type = "stitched";
          let category = "boy";
          await strapi.api.products.services.brands.junaidjamshed.kids.girls.scrapping.scrapping(
            category,
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
