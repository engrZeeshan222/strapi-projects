const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async singleProductScraping(
    link,
    brand,
    colors,
    sizesList,
    fabricList,
    classification
  ) {
    try {
      const { data } = await axios.get(link);
      let selector = cheerio.load(data, { normalizeWhitespace: true });
      let check = selector("body")
        .find("#product-description #AddToCartForm .size-chart")
        .attr("data-tags");
      ////////title, images,description,detaildescription
      let metadata =
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
          metadata.detailDescription
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
        let productColor = metadata.detailDescription.toLowerCase();
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

      metadata =
        await strapi.api.products.services.brands.limelight.commonfunction.partsOfProduct(
          selector,
          metadata,
          sizesList
        );

      metadata =
        await strapi.api.products.services.brands.limelight.commonfunction.partsOfProduct(
          selector,
          metadata
        );

      //body
      let body = {
        category: "women",
        embroidered: metadata.emb,
        classification: classification._id,
        productTitle: metadata.productTitle,
        pant: metadata.pants,
        tights: metadata.tight,
        trouser: metadata.trouser,
        shalwar: metadata.shalwar,
        sizes: metadata.sizeArray,
        fabric: profabric,
        fabrics: productFabrics,
        detailDescription: metadata.detailDescription,
        piece: metadata.pieces,
        originalPrice: originalPrice,
        sale: null,
        salePrice: salePrice,
        inStock: true,
        colors: productColors,
        color: proColor,
        brand: brand._id,
        pictures: metadata.pictures,
        title: metadata.title,
        link: metadata.url,
        sku: metadata.sku,
        description: metadata.description,
      };

      // console.log(body);
      const producty = await strapi.services.products.findOne({
        link: metadata.url,
      });

      //if added then update needed
      if (producty) {
        console.log("found");
        let entity;
        if (salePrice != producty.salePrice) {
          entity = await strapi.services.products.update(
            { link: metadata.url },
            body
          );
        }
        // // if (inStock != producty.inStock) {
        // //   entity = await strapi.services.products.update(
        // //     { link: metadata.url },
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
  async collectionScrapping(
    link,
    brand,
    colors,
    fabricList,
    sizesList,
    classification
  ) {
    let i = 1;
    let html;
    do {
      try {
        const { data } = await axios.get(link + `?page=${i}`);
        let selector = await cheerio.load(data, { normalizeWhitespace: true });
        let body = await selector("body").find("#product-loop .product");
        html = selector(body).html();

        selector(body).each(async (i, element) => {
          let href = selector(element).find(".ci >a").attr("href");
          let proLink = "https://www.limelight.pk" + href;
          await this.singleProductScraping(
            proLink,
            brand,
            colors,
            sizesList,
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
  async scrapping(brand, colors, fabricList, sizesList, classification) {
    try {
      const { data } = await axios.get(classification.link);
      let selector = await cheerio.load(data, { normalizeWhitespace: true });

      let collections = selector("body").find(" #content .custom-class01 .row");

      selector(collections).each(async (i, element) => {
        let link =
          "https://www.limelight.pk" +
          selector(element).find(".title__viewAll .heading-link ").attr("href");

        let name = selector(element)
          .find(".title__viewAll .heading-link ")
          .text()
          .trim();

        console.log(link);
        if (link === "https://www.limelight.pk/collections/trousers2") {
          await this.collectionScrapping(
            link,
            brand,
            colors,
            fabricList,
            sizesList,
            classification
          );
        }
        if (link === "https://www.limelight.pk/collections/velvet-trouser") {
          await this.collectionScrapping(
            link,
            brand,
            colors,
            fabricList,
            sizesList,
            classification
          );
        }
        if (link === "https://www.limelight.pk/collections/tights") {
          await this.collectionScrapping(
            link,
            brand,
            colors,
            fabricList,
            sizesList,
            classification
          );
        }
        if (link === "https://www.limelight.pk/collections/bottoms-pants") {
          await this.collectionScrapping(
            link,
            brand,
            colors,
            fabricList,
            sizesList,
            classification
          );
        }
        if (link === "https://www.limelight.pk/collections/shalwars1") {
          await this.collectionScrapping(
            link,
            brand,
            colors,
            fabricList,
            sizesList,
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
