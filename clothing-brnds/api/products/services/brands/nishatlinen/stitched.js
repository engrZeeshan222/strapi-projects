const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async scrappingOfSingleProduct(
    classification,
    link,
    collection,
    brand,
    fabricList,
    colors,
    sizesList
  ) {
    try {
      const { data } = await axios.get(link);
      let selector = await cheerio.load(data, { normalizeWhitespace: true });

      // geting data by meta data productTitle,description,url
      let productTitle = selector('meta[property="og:title"]').attr("content");
      let type = selector('meta[property="og:type"]').attr("content");
      let description = selector('meta[property="og:description"]').attr(
        "content"
      );
      let url = selector('meta[property="og:url"]').attr("content");

      //getting pictures
      let pictures = selector("body").find(
        ".product__thumbs--scroller .product__thumb-item .image-wrap > a"
      );
      let obj = new Object();
      let picturesArray = [];
      await selector(pictures).each(async (i, ele) => {
        if (parseInt(i) === 0) {
          obj.main = true;
        } else {
          obj.main = false;
        }
        obj.pictureLink = selector(ele).attr("href");
        picturesArray.push({ ...obj });
      });

      //getting detailes of product
      let metaData = selector("body").find(".product-single__meta");

      //outofStock
      let soldout = selector(metaData)
        .find(".payment-buttons > button > span")
        .text()
        .trim();
      let inStock = true;
      if (soldout.includes("Sold Out")) {
        inStock = false;
      }

      //sku
      let sku = selector(metaData).find(".product-single__sku").text().trim();

      //price
      let originalPrice;
      let salePrice = null;
      let sale = selector(metaData)
        .find(".product__price-savings")
        .text()
        .trim();
      let prices = selector("body").find(".product__price");
      selector(prices).each(async (i, element) => {
        if (i === 0) {
          let oP = selector(element).text().trim();
          originalPrice = Number(oP.split(".")[1].replace(",", ""));
        } else {
          let sP = selector(element).text().trim();
          salePrice = Number(sP.split(".")[1].replace(",", ""));
        }
      });

      let proColor, proFabric, proMeasurement;
      let detailDescription = "";
      let productColors = [];
      let productFabrics = [];

      //fabric and color

      let info = selector("body").find(".variant-input-wrap");
      selector(info).each(async (i, element) => {
        if (selector(element).attr("name") === "Color") {
          proColor = selector(element)
            .find(".variant-input")
            .attr("data-value");
        } else if (selector(element).attr("name") === "Fabric") {
          proFabric = selector(element)
            .find(".variant-input")
            .attr("data-value");
          productFabric = proFabric.toLowerCase();
        }
      });

      // link fabric associated with products
      await selector(metaData)
        .find(".product-single__description")
        .each(function (i, elm) {
          detailDescription = selector(this).html();
        });

      //fabric
      for (let ele of fabricList) {
        if (detailDescription.toLowerCase().includes(ele.name.toLowerCase())) {
          productFabrics.push(ele._id);
          proFabric = proFabric + " " + ele.name;
        }
      }

      //color
      for (let color of colors) {
        let productColor = detailDescription.toLowerCase();
        let colorName = color.name.toLowerCase();
        if (productColor.includes(colorName)) {
          productColors.push(color._id);
          proColor = proColor + " " + colorName;
        }
      }

      //no. of pieces
      let pieces,
        parts,
        shirt,
        trouser,
        pants,
        dupatta,
        shalwar,
        dress,
        loungeWear;
      if (detailDescription.toLowerCase().includes("lounge wear")) {
        loungeWear = true;
      }
      if (detailDescription.toLowerCase().includes("hues")) {
        shirt = true;
      }
      //single shirt or 2 or 3 pieces
      if (detailDescription.toLowerCase().includes("shirt")) {
        if (detailDescription.toLowerCase().includes("dupatta")) {
          if (detailDescription.toLowerCase().includes("trouser")) {
            pieces = "ThreePieces";
            dupatta = true;
            shirt = true;
            trouser = true;
          } else {
            pieces = "TwoPieces";
            dupatta = true;
            shirt = true;
          }
        } else if (detailDescription.toLowerCase().includes("trouser")) {
          pieces = "TwoPieces";
          trouser = true;
          shirt = true;
        } else {
          piece = "OnePiece";
          shirt = true;
        }
      } else if (detailDescription.includes("trouser")) {
        pieces = "OnePiece";
        parts = "Trouser";
        trouser = true;
      } else if (detailDescription.includes("shalwar")) {
        pieces = "OnePiece";
        parts = "Shalwar";
        shalwar = true;
      } else if (detailDescription.includes("pant")) {
        pieces = "OnePiece";
        parts = "Pant";
        pants = true;
      } else if (detailDescription.toLowerCase().includes("dress")) {
        dress = true;
        pieces = "OnePiece";
      }

      //EMBROIDERED
      let emb;
      if (productTitle.toLowerCase().includes("embroid")) {
        emb = true;
      }
      if (productTitle.includes("EMB")) {
        emb = true;
      }

      //sizes
      let sizearr = [];

      let productSize = selector("body").find(".variant-input");
      selector(productSize).each(async (i, element) => {
        for (let s of sizesList) {
          if (selector(element).text().trim() === s.size) {
            sizearr.push(s._id);
            break;
          }
        }
      });

      let body;
      //gather whole data in one object
      if (
        classification.title != "Lounge Wear" &&
        classification.title != "Hues"
      ) {
        body = {
          category: "women",
          embroidered: emb,
          classification: classification._id,
          shirt: shirt,
          dupatta: dupatta,
          trouser: trouser,
          shalwar: shalwar,
          pant: pants,
          dress: dress,
          fabric: proFabric,
          stitched: true,
          sizes: sizearr,
          fabrics: productFabrics,
          measurment: proMeasurement,
          detailDescription: detailDescription,
          piece: pieces,
          parts: parts,
          originalPrice: originalPrice,
          sale: sale,
          salePrice: salePrice,
          inStock: inStock,
          collections: collection._id,
          colors: productColors,
          color: proColor,
          brand: brand._id,
          loungeWear: loungeWear,
          pictures: picturesArray,
          title: productTitle,
          link: url,
          sku: sku,
          description: description,
        };
      } else {
        body = {
          category: "women",
          embroidered: emb,
          classification: classification._id,
          shirt: shirt,
          dupatta: dupatta,
          trouser: trouser,
          shalwar: shalwar,
          pant: pants,
          dress: dress,
          fabric: proFabric,
          stitched: true,
          sizes: sizearr,
          fabrics: productFabrics,
          measurment: proMeasurement,
          detailDescription: detailDescription,
          piece: pieces,
          parts: parts,
          originalPrice: originalPrice,
          sale: sale,
          salePrice: salePrice,
          inStock: inStock,
          colors: productColors,
          color: proColor,
          brand: brand._id,
          loungeWear: loungeWear,
          pictures: picturesArray,
          title: productTitle,
          link: url,
          sku: sku,
          description: description,
        };
      }

      const producty = await strapi.services.products.findOne({ link: url });

      //if added then update needed
      if (producty) {
        console.log("found");
        let entity;
        if (salePrice != producty.salePrice) {
          entity = await strapi.services.products.update({ link: url }, body);
        }
        if (inStock != producty.inStock) {
          entity = await strapi.services.products.update({ link: url }, body);
        }
      } else if (!producty) {
        console.log("notFound");
        entities = await strapi.services.products.create(body);
      }
    } catch (err) {
      console.log(err);
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },

  async scrapping(
    classification,
    link,
    collection,
    brand,
    fabricList,
    colors,
    sizelist
  ) {
    try {
      const { data } = await axios.get(link);

      //scraping the specific collection
      let selector = await cheerio.load(data, { normalizeWhitespace: true });

      //gets the all product links
      let products = await selector("body").find(".grid-product__content > a");
      selector(products).each(async (i, element) => {
        //specific product scraping
        let link = selector(element).attr("href");
        let linked = "https://nishatlinen.com" + link;
        await this.scrappingOfSingleProduct(
          classification,
          linked,
          collection,
          brand,
          fabricList,
          colors,
          sizelist
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
