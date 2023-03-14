const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async singleProductScraping(
    link,
    brand,
    colors,
    fabricList,
    classification,
    collection
  ) {
    try {
      const { data } = await axios.get(link);
      let selector = cheerio.load(data, { normalizeWhitespace: true });
      let check = selector("body")
        .find("#product-description #AddToCartForm .size-chart")
        .attr("data-tags");
      ////////title, images,description,detaildescription
      let productData =
        await strapi.api.products.services.brands.limelight.commonfunction.metaData(
          selector
        );

      /////price//////
      let originalPrice = Number(
        selector("body")
          .find("#product-description #product-price .product-price .money")
          .text()
          .trim()
          .split(" ")[1]
          .replace(",", "")
      );
      let price = selector("body")
        .find("#product-description #product-price .was .money")
        .text()
        .trim();
      let salePrice;
      if (price) {
        price = Number(price.split(" ")[1].replace(",", ""));
        salePrice = originalPrice;
        originalPrice = price;
      }

      ////fabric
      let productFabrics = [];
      let profabric = "";

      for (let ele of fabricList) {
        if (
          productData.detailDescription
            .toLowerCase()
            .includes(ele.name.toLowerCase())
        ) {
          productFabrics.push(ele._id);
          profabric = profabric + " " + ele.name;
        }
      }

      ///color
      let productColors = [];
      let proColor = "";

      for (let color of colors) {
        let productColor = productData.detailDescription.toLowerCase();
        let colorName = color.name.toLowerCase();
        if (productColor.includes(colorName)) {
          productColors.push(color._id);
          proColor = proColor + " " + color.name;
        }
      }

      ////recheck color and fabric

      if (!productFabrics.length) {
        for (let ele of fabricList) {
          if (check.toLowerCase().includes(ele.name.toLowerCase())) {
            productFabrics.push(ele._id);
          }
        }
      }

      if (!productColors.length) {
        for (let color of colors) {
          let productColor = check.toLowerCase();
          let colorName = color.name.toLowerCase();
          if (productColor.includes(colorName)) {
            productColors.push(color._id);
            proColor = proColor + " " + color.name;
          }
        }
      }
      ////size////;
      productData =
        await strapi.api.products.services.brands.limelight.commonfunction.partsOfProduct(
          selector,
          productData
        );

      //body
      let body = {
        category: "women",
        embroidered: productData.emb,
        classification: classification._id,
        productTitle: productData.productTitle,
        shirt: productData.shirt,
        dupatta: productData.dupatta,
        trouser: productData.trouser,
        shalwar: productData.shalwar,
        pant: productData.pants,
        dress: productData.dress,
        fabric: profabric,
        fabrics: productFabrics,
        detailDescription: productData.detailDescription,
        piece: productData.pieces,
        originalPrice: originalPrice,
        collections: collection._id,
        sale: null,
        salePrice: salePrice,
        inStock: true,
        colors: productColors,
        color: proColor,
        brand: brand._id,
        pictures: productData.pictures,
        title: productData.title,
        link: productData.url,
        sku: productData.sku,
        description: productData.description,
      };

      // console.log(body);
      const producty = await strapi.services.products.findOne({
        link: productData.url,
      });

      //if added then update needed
      if (producty) {
        console.log("found");
        let entity;
        if (salePrice != producty.salePrice) {
          entity = await strapi.services.products.update(
            { link: productData.url },
            body
          );
        }
        // // if (inStock != producty.inStock) {
        // //   entity = await strapi.services.products.update(
        // //     { link: productData.url },
        // //     body
        // //   );
        // }
      } else if (!producty) {
        console.log("notFound");
        entities = await strapi.services.products.create(body);
      }
    } catch (err) {
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
  async scrapping(brand, colors, fabricList, classification) {
    try {
      const { data } = await axios.get(classification.link);
      let selector = await cheerio.load(data, { normalizeWhitespace: true });

      let collections = selector("body").find(
        "#PageContainer #content .custom-class01 .row"
      );

      selector(collections).each(async (i, element) => {
        let link =
          "https://www.limelight.pk" +
          selector(element).find(".title__viewAll .heading-link ").attr("href");

        let name = selector(element)
          .find(".title__viewAll .heading-link ")
          .text()
          .trim();

        let collections = await strapi.services.collections.findOne({
          title: name,
          brand: brand._id,
        });
        if (!collections) {
          let newCollection = await strapi.services.collections.create({
            title: name,
            link: link,
            brand: brand._id,
          });
          collections = newCollection;
        }

        if (
          collections.link ===
          "https://www.limelight.pk/collections/unstitched-eid-2-edition"
        ) {
          await strapi.api.products.services.brands.limelight.commonfunction.collectionScrappingForUnstitch(
            brand,
            colors,
            fabricList,
            classification,
            collections
          );
        } else if (
          collections.link ===
          "https://www.limelight.pk/collections/unstitched-eid-edition"
        ) {
          await strapi.api.products.services.brands.limelight.commonfunction.collectionScrappingForUnstitch(
            brand,
            colors,
            fabricList,
            classification,
            collections
          );
        } else if (
          collections.link ===
          "https://www.limelight.pk/collections/summer-unstitched-21"
        ) {
          await strapi.api.products.services.brands.limelight.commonfunction.collectionScrappingForUnstitch(
            brand,
            colors,
            fabricList,
            classification,
            collections
          );
        } else if (
          collections.link ===
          "https://www.limelight.pk/collections/be-yourself"
        ) {
          await strapi.api.products.services.brands.limelight.commonfunction.collectionScrappingForUnstitch(
            brand,
            colors,
            fabricList,
            classification,
            collections
          );
        } else if (
          collections.link ===
          "https://www.limelight.pk/collections/unstitched-trousers"
        ) {
          await strapi.api.products.services.brands.limelight.commonfunction.collectionScrappingForUnstitch(
            brand,
            colors,
            fabricList,
            classification,
            collections
          );
        } else if (
          collections.link ===
          "https://www.limelight.pk/collections/summer-unstitched-20"
        ) {
          await strapi.api.products.services.brands.limelight.commonfunction.collectionScrappingForUnstitch(
            brand,
            colors,
            fabricList,
            classification,
            collections
          );
        }
        if (
          collections.link ===
          "https://www.limelight.pk/collections/winter-unstitched-20"
        ) {
          await strapi.api.products.services.brands.limelight.commonfunction.collectionScrappingForUnstitch(
            brand,
            colors,
            fabricList,
            classification,
            collections
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
};
