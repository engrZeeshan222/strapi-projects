const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async scrappingOfSingleProduct(
    classification,
    link,
    collection,
    brand,
    fabricList,
    colors
  ) {
    try {
      const { data } = await axios.get(link);

      let selector = await cheerio.load(data, { normalizeWhitespace: true });
      let productTitle = selector('meta[property="og:title"]').attr("content");

      let type = selector('meta[property="og:type"]').attr("content");
      let description = selector('meta[property="og:description"]').attr(
        "content"
      );
      let url = selector('meta[property="og:url"]').attr("content");

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
      let metaData = selector("body").find(".product-single__meta");

      //soldout
      let soldout = selector(metaData)
        .find(".payment-buttons > button > span")
        .text()
        .trim();
      let inStock = true;
      if (soldout.includes("Sold Out")) {
        inStock = false;
      }
      let sku = selector(metaData).find(".product-single__sku").text().trim();
      let originalPrice;
      let saleprice = null;
      let sale = selector(metaData)
        .find(".product__price-savings")
        .text()
        .trim();
      let prices = selector("body").find(".product__price");

      //prices
      selector(prices).each(async (i, element) => {
        if (i === 0) {
          let oP = selector(element).text().trim();
          originalPrice = Number(oP.split(".")[1].replace(",", ""));
        } else {
          let sP = selector(element).text().trim();
          saleprice = Number(sP.split(".")[1].replace(",", ""));
        }
      });
      let proColor = "",
        proFabric = "",
        proMeasurement;
      let detailDescription = "";
      let productColors = [];
      let productFabrics = [];

      //information
      //deatail description
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

      let pieces, parts, shirt, trouser, pants, dupatta, shalwar, dress;

      //EMBROIDERED
      let emb;
      if (productTitle.toLowerCase().includes("embroider")) {
        emb = true;
      }
      if (productTitle.includes("EMB")) {
        emb = true;
      }

      //if three piece
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
      }
      let body = {
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
        fabrics: productFabrics,
        measurment: proMeasurement,
        detailDescription: detailDescription,
        piece: pieces,
        parts: parts,
        originalPrice: originalPrice,
        sale: sale,
        salePrice: saleprice,
        inStock: inStock,
        collections: collection._id,
        colors: productColors,
        color: proColor,
        brand: brand._id,
        pictures: picturesArray,
        title: productTitle,
        link: url,
        sku: sku,
        description: description,
      };

      const producty = await strapi.services.products.findOne({ link: url });
      if (producty) {
        console.log("found");

        let entity;
        if (saleprice != producty.salePrice) {
          entity = await strapi.services.products.update({ link: url }, body);
        }
        if (inStock != producty.inStock) {
          entity = await strapi.services.products.update({ link: url }, body);
        }
      } else if (!producty) {
        console.log("not found");

        entities = await strapi.services.products.create(body);
      }
    } catch (err) {
      console.log(err.message);
      let obj = {
        brands: brand._id,
        error: JSON.stringify(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
  async scrapping(classification, link, collection, brand, fabricList, colors) {
    try {
      const { data } = await axios.get(link);
      let selector = await cheerio.load(data, { normalizeWhitespace: true });
      let products = await selector("body").find(".grid-product__content > a");
      // let ele1 = selector("body").find(".grid-product__content > a");
      selector(products).each(async (i, element) => {
        let link = selector(element).attr("href");
        let linked = "https://nishatlinen.com" + link;
        await this.scrappingOfSingleProduct(
          classification,
          linked,
          collection,
          brand,
          fabricList,
          colors
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
