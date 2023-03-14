const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async men(collection, linked, brand, fabricList, colors, sizesList) {
    try {
      const { data } = await axios.get(linked);
      let selector = await cheerio.load(data, { normalizeWhitespace: true });
      let types = selector("body").find(".grid--uniform .medium-up--one-fifth");

      await selector(types).each(async (i, element) => {
        let select = selector(element).find(".collection-item").attr("href");
        let classificationName = selector(element)
          .find(".collection-item__title")
          .text()
          .trim();
        let classification = await strapi.services.classification.findOne({
          link: "https://nishatlinen.com" + select,
          brand: brand._id,
        });
        if (!classification) {
          let newCollection = await strapi.services.classification.create({
            title: classificationName,
            link: "https://nishatlinen.com" + select,
            brand: brand._id,
          });
          classification = newCollection;
        }
        let link = classification.link;
        if (classification.title === "Pack Suit") {
          await strapi.api.products.services.brands.nishatlinen.menstitched.scrapping(
            classification,
            link,
            collection,
            brand,
            fabricList,
            colors,
            sizesList
          );
        }
      });
    } catch (err) {
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },

  async scrappingMenCloths() {
    try {
      let fabricList = await strapi.api.fabric.services.fabric.find();
      let colors = await strapi.api.colors.services.colors.find();
      let sizesList = await strapi.api.sizes.services.sizes.find();
      let brand = await strapi.api.brands.services.brands.findOne({
        name: "nishatlinen",
      });
      if (!brand) {
        brand = await strapi.api.brands.services.brands.create({
          name: "nishatlinen",
          link: "https://nishatlinen.com",
        });
      }
      const { data } = await axios.get(
        "https://nishatlinen.com/collections/men"
      );
      let selector1 = await cheerio.load(data, { normalizeWhitespace: true });
      let collections = await selector1("body").find(
        ".grid--uniform .grid__item .collection-item"
      );
      let cat;
      selector1(collections).each(async (i, element) => {
        let select = selector1(element).attr("href");
        let collectionName = selector1(element)
          .find(".collection-item__title")
          .text()
          .trim();
        let collection = await strapi.services.collections.findOne({
          title: collectionName,
          brand: brand._id,
        });
        if (!collection) {
          let newCollection = await strapi.services.collections.create({
            title: collectionName,
            brand: brand._id,
          });
          collection = newCollection;
        }
        let linked = "https://nishatlinen.com" + select;
        await this.men(
          collection,
          linked,
          brand,
          fabricList,
          colors,
          sizesList
        );
      });
    } catch (err) {
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
};
