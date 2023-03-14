const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async stitched(classification, brand, fabricList, colors, sizesList) {
    // console.log(ele);
    const { data } = await axios.get(classification.link);
    let selector = await cheerio.load(data, { normalizeWhitespace: true });
    let types = selector("body").find(".grid--uniform .medium-up--one-fifth");
    await selector(types).each(async (i, element) => {
      let link, collectionName;

      link = selector(element).find("a").attr("href");
      collectionName = selector(element)
        .find(".collection-item__title")
        .text()
        .trim();
      console.log("+++++++++++++++", collectionName, "+++++++++++++");
      let collections = await strapi.services.collections.findOne({
        title: collectionName,
        brand: brand._id,
      });
      if (!collections) {
        let newCollection = await strapi.services.collections.create({
          title: collectionName,
          brand: brand._id,
        });
        collections = newCollection;
      }

      let linked = "https://nishatlinen.com" + link;
      await strapi.api.products.services.brands.nishatlinen.stitched.scrapping(
        classification,
        linked,
        collections,
        brand,
        fabricList,
        colors,
        sizesList
      );
    });
  },
  async unstitched(classification, brand, fabricList, colors) {
    const { data } = await axios.get(classification.link);

    let selector = cheerio.load(data, { normalizeWhitespace: true });
    let types = selector("body").find(".grid--uniform .medium-up--one-fifth");
    selector(types).each(async (i, element) => {
      let link, collectionName;

      link = selector(element).find("a").attr("href");
      collectionName = selector(element)
        .find(".collection-item__title")
        .text()
        .trim();
      console.log("+++++++++++++++", collectionName, "+++++++++++++");
      let collections = await strapi.services.collections.findOne({
        title: collectionName,
        brand: brand._id,
      });

      if (!collections) {
        let newCollection = await strapi.services.collections.create({
          title: collectionName,
          brand: brand._id,
        });

        collections = newCollection;
      }

      let linked = "https://nishatlinen.com" + link;
      await strapi.api.products.services.brands.nishatlinen.unstitched.scrapping(
        classification,
        linked,
        collections,
        brand,
        fabricList,
        colors
      );
    });
  },
  async classification() {
    try {
      let brand = await strapi.api.brands.services.brands.findOne({
        name: "nishatlinen",
      });

      if (!brand) {
        brand = await strapi.api.brands.services.brands.create({
          name: "nishatlinen",
          link: "https://nishatlinen.com",
        });
      }
      console.log(brand);
      const { data } = await axios.get(
        "https://nishatlinen.com/collections/women"
      );

      let selector1 = cheerio.load(data, { normalizeWhitespace: true });
      let classifications = selector1("body").find(
        ".grid--uniform .grid__item .collection-item"
      );

      selector1(classifications).each(async (i, element) => {
        let select = selector1(element).attr("href");
        let classificationName = selector1(element)
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
        classificationArray.push(classification);
        // console.log(classification);
      });
    } catch (err) {
      console.log(err);
    }
  },
  async scrappingCloths() {
    try {
      let fabricList = await strapi.api.fabric.services.fabric.find();
      let colors = await strapi.api.colors.services.colors.find();
      let sizesList = await strapi.api.sizes.services.sizes.find();
      let brand = await strapi.api.brands.services.brands.findOne({
        name: "nishatlinen",
      });
      console.log("IN SCRAPPING CLOTHS");
      let classification;
      let classificationArray = await strapi.services.classification.find();

      for (let index = 0; index < classificationArray.length; index++) {
        console.log(classificationArray[index].link);
        classification = classificationArray[index];
        if (
          classificationArray[index].link ===
          "https://nishatlinen.com/collections/unstitched"
        ) {
          await this.unstitched(classification, brand, fabricList, colors);
        } else if (
          classificationArray[index].link ===
          "https://nishatlinen.com/collections/ready-to-wear-1"
        ) {
          await this.stitched(
            classification,
            brand,
            fabricList,
            colors,
            sizesList
          );
        } else if (
          classificationArray[index].link ===
          "https://nishatlinen.com/collections/lowers"
        ) {
          await this.stitched(
            classification,
            brand,
            fabricList,
            colors,
            sizesList
          );
        } else if (
          classificationArray[index].link ===
          "https://nishatlinen.com/collections/fusion-tops"
        ) {
          console.log("fusion top");

          await this.stitched(
            classification,
            brand,
            fabricList,
            colors,
            sizesList
          );
        } else if (
          classificationArray[index].link ===
          "https://nishatlinen.com/collections/lounge-wear"
        ) {
          console.log("lounge - wear", classification.link);
          let collection;

          await strapi.api.products.services.brands.nishatlinen.stitched.scrapping(
            classification,
            classification.link,
            collection,
            brand,
            fabricList,
            colors,
            sizesList
          );
        } else if (
          classificationArray[index].link ===
          "https://nishatlinen.com/collections/hues-summer-2021"
        ) {
          console.log("hues-summer-2021", classification.link);
          let collection;

          await strapi.api.products.services.brands.nishatlinen.stitched.scrapping(
            classification,
            classification.link,
            collection,
            brand,
            fabricList,
            colors,
            sizesList
          );
        }
      }
    } catch (err) {
      console.log(err);
      let obj = {
        brands: brand._id,
        error: JSON.stringify(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
};
