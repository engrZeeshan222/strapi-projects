const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async singleProductScraping(link, brand, colors, fabricList, classification) {
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
      ////size/////

      //pieces

      productData =
        await strapi.api.products.services.brands.limelight.commonfunction.partsOfProduct(
          selector,
          productData
        );

      // console.log(productData);
      //body
      let body = {
        category: "women",
        embroidered: productData.emb,
        classification: classification._id,
        productTitle: productData.productTitle,
        dupatta: productData.dupatta,
        scarf: productData.scarf,
        fabric: profabric,
        stitched: true,
        fabrics: productFabrics,
        detailDescription: productData.detailDescription,
        piece: productData.pieces,
        originalPrice: originalPrice,
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
  async collectionScrapping(link, brand, colors, fabricList, classification) {
    let i = 1;
    let html;

    do {
      try {
        // console.log(link);
        const { data } = await axios.get(link + `?page=${i}`);
        let selector = await cheerio.load(data, { normalizeWhitespace: true });
        let body = await selector("body").find("#product-loop .product");
        html = selector(body).html();

        selector(body).each(async (i, element) => {
          let href = selector(element).find(".ci >a").attr("href");
          let proLink = "https://www.limelight.pk" + href;
          // console.log(proLink);
          await this.singleProductScraping(
            proLink,
            brand,
            colors,
            fabricList,
            classification
          );
        });
        i++;
      } catch (err) {
        let obj = {
          brands: brand._id,
          error: JSON.parse(err),
        };
        await strapi.api.error.services.error.create(obj);
      }
    } while (html != null);
  },

  async scrapping(brand, colors, fabricList, classification) {
    try {
      const { data } = await axios.get(classification.link);
      let selector = await cheerio.load(data, { normalizeWhitespace: true });

      let collection = await selector("body").find(
        "#content .custom-class01 .row"
      );

      selector(collection).each(async (i, element) => {
        let href = selector(element).find(".title__viewAll >a").attr("href");
        let link = "https://www.limelight.pk" + href;
        console.log(link);

        if (link === "https://www.limelight.pk/collections/dupattas") {
          await this.collectionScrapping(
            link,
            brand,
            colors,
            fabricList,

            classification
          );
        } else if (link === "https://www.limelight.pk/collections/scarves") {
          await this.collectionScrapping(
            link,
            brand,
            colors,
            fabricList,

            classification
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
