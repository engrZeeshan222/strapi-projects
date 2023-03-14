const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async singleProductScraping(type, brand, url, colors, fabricList, sizesList) {
    try {
      let { data } = await axios.get(url);
      let selector = cheerio.load(data, { normalizeWhitespace: true });

      let proColor, proFabric;
      let productColors = [];
      let productFabrics = [];
      // pictures
      let pictures = selector("body").find(
        ".MagicToolboxContainer .MagicToolboxSelectorsContainer .mt-thumb-switcher "
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

      ///////////////////////////product title/////////////////////////
      let productTitle = selector('meta[name="title"]').attr("content");

      /////////////////////////product main info//////////////////////////
      let productmainInfo = selector("body").find(".product-info-main");

      /////////////sku////////////
      let sku = selector(productmainInfo)
        .find(".product-info-stock-sku .sku .value")
        .text()
        .trim();

      //////////////////soldout/////////////

      let soldout = selector(productmainInfo)
        .find(".product-info-stock-sku .stock")
        .text()
        .trim();
      let inStock = false;
      if (soldout.includes("In stock")) {
        inStock = true;
      }

      ///////////price/////////
      let saleprice = null;
      let sale;
      let originalPrice = Number(
        selector(productmainInfo)
          .find(
            ".product-info-price .price-final_price .price-container .price-wrapper"
          )
          .attr("data-price-amount")
      );

      ////////detaildescription/////////

      let description = selector('meta[property="og:description"]').attr(
        "content"
      );
      let detailDescription = `<div>${
        selector(productmainInfo).find(".overview").html()
          ? selector(productmainInfo).find(".overview").html()
          : ""
      } ${selector(productmainInfo)
        .find(".product-info-main-extend .content")
        .html()} </div>`;

      ////////COLOR FABRIC PIECES////////

      let productDetails = selector(productmainInfo)
        .find("#product-attribute-specs-table")
        .html();
      let table = selector(productDetails).find("> tr");

      let piece, collection;

      selector(table).each(async (i, el) => {
        if (selector(el).find("> th ").text().trim() === "Product Category") {
          piece = selector(el).find("> td ").text().trim();
        } else if (selector(el).find("> th ").text().trim() === "Color") {
          proColor = selector(el).find("> td ").text().trim();
        } else if (selector(el).find("> th ").text().trim() === "Fabric") {
          proFabric = selector(el).find("> td ").text().trim();
        } else if (selector(el).find("> th ").text().trim() === "Collection") {
          collection = selector(el).find("> td ").text().trim();
        }
      });

      //fabric
      if (proFabric) {
        for (let ele of fabricList) {
          if (proFabric.toLowerCase().includes(ele.name.toLowerCase())) {
            productFabrics.push(ele._id);
          }
        }
      }
      //color
      if (proColor) {
        for (let color of colors) {
          let productColor = proColor.toLowerCase();
          let colorName = color.name.toLowerCase();
          if (productColor.includes(colorName)) {
            productColors.push(color._id);
          }
        }
      }
      //stitched or not
      let stitched = false;
      if (type == "stitched") {
        stitched = true;
      }
      //collections
      let collectionEntity;
      if (collection) {
        collectionEntity = await strapi.services.collections.findOne({
          title: collection,
          brand: brand._id,
        });

        if (!collectionEntity) {
          let newCollection = await strapi.services.collections.create({
            title: collection,
            brand: brand._id,
          });
          collectionEntity = newCollection;
        }
      }
      let pieces, parts, shirt, trouser, pants, dupatta, shalwar, dress;

      if (piece.toLowerCase().includes("Kurti")) {
        pieces = "OnePiece";
        shirt = true;
      }
      if (piece) {
        if (piece.toLowerCase().includes("3")) {
          pieces = "ThreePieces";
          shirt = true;
          trouser = true;
          dupatta = true;
        } else if (piece.toLowerCase().includes("2")) {
          pieces = "TwoPieces";

          if (detailDescription.toLowerCase().includes("shirt")) {
            if (detailDescription.toLowerCase().includes("dupatta")) {
              shirt = true;
              dupatta = true;
            } else {
              shirt = true;
              trouser = true;
            }
          } else if (piece.toLowerCase().includes("1")) {
            pieces = "OnePiece";
            shirt = true;
          }
        }
        ///embroided or not

        let emb;
        if (detailDescription) {
          if (detailDescription.toLowerCase().includes("embroider")) {
            emb = true;
          }
          if (detailDescription.includes("EMB")) {
            emb = true;
          }
        }
        let sizeArray = [];
        if (type === "stitched") {
          for (let size of sizesList) {
            sizeArray.push(size._id);
          }
        }
        let body;
        if (collectionEntity) {
          body = {
            category: "women",
            embroidered: emb,
            shirt: shirt,
            dupatta: dupatta,
            trouser: trouser,
            shalwar: shalwar,
            pant: pants,
            dress: dress,
            fabric: proFabric,
            type: type,
            stitched: stitched,
            fabrics: productFabrics,
            detailDescription: detailDescription,
            piece: pieces,
            originalPrice: originalPrice,
            sale: sale,
            salePrice: saleprice,
            inStock: inStock,
            collections: collectionEntity._id,
            colors: productColors,
            color: proColor,
            brand: brand._id,
            sizes: sizeArray,
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
            shirt: shirt,
            dupatta: dupatta,
            trouser: trouser,
            shalwar: shalwar,
            pant: pants,
            dress: dress,
            fabric: proFabric,
            type: type,
            fabrics: productFabrics,
            detailDescription: detailDescription,
            piece: pieces,
            originalPrice: originalPrice,
            sizes: sizeArray,
            sale: sale,
            salePrice: saleprice,
            inStock: inStock,
            colors: productColors,
            color: proColor,
            brands: brand._id,
            pictures: picturesArray,
            Title: productTitle,
            link: url,
            sku: sku,
            description: description,
          };
        }

        const producty = await strapi.services.products.findOne({ link: url });
        let entity;
        if (producty) {
          console.log("found");

          if (saleprice != producty.salePrice) {
            entity = await strapi.services.products.update({ link: url }, body);
          }
          if (inStock != producty.inStock) {
            entity = await strapi.services.products.update({ link: url }, body);
          }
        } else if (!producty) {
          console.log("not found");

          entity = await strapi.services.products.create(body);
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
  async unstitchedScrapping(type, brand, link, colors, fabricList, sizesList) {
    try {
      let pageNo = 1;
      let { data } = await axios.get(
        link + `?p=${pageNo}&product_list_limit=30`
      );
      let selector = cheerio.load(data, { normalizeWhitespace: true });

      let findingNoOfproducts = selector("body").find(
        ".toolbar-products #toolbar-amount > span"
      );
      let noOfProducts = 0;
      selector(findingNoOfproducts).each(async (i, ele) => {
        if (Number(selector(ele).text()) > noOfProducts);
        {
          noOfProducts = Number(selector(ele).text());
        }
      });
      console.log(noOfProducts);
      let totalNoOfPages = Math.ceil(noOfProducts / 30);
      console.log(totalNoOfPages);
      for (let i = 1; i <= totalNoOfPages; i++) {
        let { data } = await axios.get(link + `?p=${i}&product_list_limit=30`);
        let selector = cheerio.load(data, { normalizeWhitespace: true });

        let products = selector("body").find(
          ".products-grid .product-items .product-item"
        );
        selector(products).each(async (i, ele) => {
          let url = selector(ele).find(".product-item-link").attr("href");
          await this.singleProductScraping(
            type,
            brand,
            url,
            colors,
            fabricList,
            sizesList
          );
        });
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
