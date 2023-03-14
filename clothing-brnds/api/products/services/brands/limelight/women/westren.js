const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async singleProductScraping(
    link,
    brand,
    colors,
    sizesList,
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

      let trouser,
        shirt,
        pants,
        pieces,
        dress,
        top,
        skirt,
        tanktop,
        tight,
        jumpsuit,
        loungewear;
      if (
        metadata.title.toLowerCase().includes("top") ||
        metadata.detailDescription.toLowerCase().includes("top")
      ) {
        pieces = JSON.parse(process.env.pieces)[1];
        top = true;
      } else if (
        metadata.title.toLowerCase().includes("tank top") ||
        metadata.detailDescription.toLowerCase().includes("tank top")
      ) {
        tanktop = true;
        pieces = JSON.parse(process.env.pieces)[1];
      } else if (
        metadata.title.toLowerCase().includes("pant") ||
        metadata.detailDescription.toLowerCase().includes("pant")
      ) {
        pants = true;
        pieces = JSON.parse(process.env.pieces)[1];
      } else if (
        metadata.title.toLowerCase().includes("tight") ||
        metadata.detailDescription.toLowerCase().includes("tight")
      ) {
        tight = true;
        pieces = JSON.parse(process.env.pieces)[1];
      } else if (
        metadata.title.toLowerCase().includes("skirt") ||
        metadata.detailDescription.toLowerCase().includes("skirt")
      ) {
        skirt = true;
        pieces = JSON.parse(process.env.pieces)[1];
      } else if (
        metadata.title.toLowerCase().includes("jumpsuit") ||
        metadata.detailDescription.toLowerCase().includes("jumpsuit")
      ) {
        jumpsuit = true;
        pieces = JSON.parse(process.env.pieces)[1];
      } else if (
        metadata.title.toLowerCase().includes("sleepwear") ||
        metadata.detailDescription.toLowerCase().includes("sleepwear") ||
        metadata.title.toLowerCase().includes("sleep wear") ||
        metadata.detailDescription.toLowerCase().includes("sleep wear")
      ) {
        loungeWear = true;
        pieces = JSON.parse(process.env.pieces)[1];
        if (
          metadata.title.toLowerCase().includes("shirt") ||
          metadata.detailDescription.toLowerCase().includes("shirt")
        ) {
          shirt = true;
          if (
            metadata.title.toLowerCase().includes("trouser") ||
            metadata.detailDescription.toLowerCase().includes("trouser")
          ) {
            trouser = true;
            pieces = JSON.parse(process.env.pieces)[2];
          }
        }
      } else if (
        metadata.title.toLowerCase().includes("dress") ||
        metadata.detailDescription.toLowerCase().includes("dress") ||
        metadata.title.toLowerCase().includes("separates") ||
        metadata.detailDescription.toLowerCase().includes("separates")
      ) {
        dress = true;
        pieces = JSON.parse(process.env.pieces)[1];
        if (
          metadata.title.toLowerCase().includes("shirt") ||
          metadata.detailDescription.toLowerCase().includes("shirt")
        ) {
          shirt = true;
          if (
            metadata.title.toLowerCase().includes("trouser") ||
            metadata.detailDescription.toLowerCase().includes("trouser")
          ) {
            trouser = true;
            pieces = JSON.parse(process.env.pieces)[2];
          }
        }
      }

      //body
      let body = {
        category: "women",
        embroidered: metadata.emb,
        classification: classification._id,
        skirt: skirt,
        jumpsuit: jumpsuit,
        tanktop: tanktop,
        top: top,
        pant: pants,
        sizes: metadata.sizeArray,
        tights: tight,
        trouser: trouser,
        shirt: shirt,
        dress: dress,
        fabric: profabric,
        fabrics: productFabrics,
        detailDescription: metadata.detailDescription,
        piece: pieces,
        originalPrice: originalPrice,
        collections: collection._id,
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
      throw err;
    }
  },
  async collectionScrapping(
    brand,
    colors,
    fabricList,
    sizesList,
    classification,
    collection
  ) {
    let i = 1;
    let html;
    try {
      do {
        const { data } = await axios.get(collection.link + `?page=${i}`);
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
            classification,
            collection
          );
        });
        i++;
      } while (html != null);
    } catch (err) {
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
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
        console.log(collections.link);
        if (link === "https://www.limelight.pk/collections/tops") {
          await this.collectionScrapping(
            brand,
            colors,
            fabricList,
            sizesList,
            classification,
            collections
          );
        }
        if (link === "https://www.limelight.pk/collections/tank-tops") {
          await this.collectionScrapping(
            brand,
            colors,
            fabricList,
            sizesList,
            classification,
            collections
          );
        }
        if (link === "https://www.limelight.pk/collections/bottoms-pants") {
          await this.collectionScrapping(
            brand,
            colors,
            fabricList,
            sizesList,
            classification,
            collections
          );
        }
        if (link === "https://www.limelight.pk/collections/tights") {
          await this.collectionScrapping(
            brand,
            colors,
            fabricList,
            sizesList,
            classification,
            collections
          );
        }
        if (link === "https://www.limelight.pk/collections/dresses-suit") {
          await this.collectionScrapping(
            brand,
            colors,
            fabricList,
            sizesList,
            classification,
            collections
          );
        }
        if (link === "https://www.limelight.pk/collections/sleepwear") {
          await this.collectionScrapping(
            brand,
            colors,
            fabricList,
            sizesList,
            classification,
            collections
          );
        }
        if (link === "https://www.limelight.pk/collections/skirts") {
          await this.collectionScrapping(
            brand,
            colors,
            fabricList,
            sizesList,
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
