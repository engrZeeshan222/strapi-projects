const axios = require("axios").default;
const cheerio = require("cheerio");

module.exports = {
  async collectionScrappingForUnstitch(
    brand,
    colors,
    fabricList,
    classification,
    collection
  ) {
    let i = 1;
    let html;
    try {
      do {
        try {
          console.log(collection.link);

          const { data } = await axios.get(collection.link + `?page=${i}`);

          let selector = cheerio.load(data, { normalizeWhitespace: true });
          let body = selector("body").find("#product-loop .product");
          html = selector(body).html();

          selector(body).each(async (i, element) => {
            let href = selector(element).find(".ci >a").attr("href");
            let proLink = "https://www.limelight.pk" + href;
            console.log(proLink);
            await strapi.api.products.services.brands.limelight.women.unstitched.singleProductScraping(
              proLink,
              brand,
              colors,
              fabricList,
              classification,
              collection
            );
          });

          i++;
        } catch (err) {
          throw err;
        }
      } while (html != null);
    } catch (err) {
      let obj = {
        brands: brand._id,
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
  async productSize(selector, data, sizesList) {
    try {
      let size = selector("body").find(
        "#product-description #AddToCartForm .clearfix .swatch-element "
      );

      let sizeArray = [];
      if (!selector(size).html()) {
        size = selector("body").find(
          "#product-description #AddToCartForm .what-is-it .it-is "
        );
        if (selector(size).text().trim() === "Free Size") {
          for (let s of sizesList) {
            if ("freeSize" === s.size) {
              sizeArray.push(s._id);
              break;
            }
          }
        }
      } else {
        selector(size).each(async (i, element) => {
          let sizes;
          if (selector(element).text().trim() === "Small") {
            sizes = "S";
          } else if (selector(element).text().trim() === "Medium") {
            sizes = "M";
          } else if (selector(element).text().trim() === "Large") {
            sizes = "L";
          } else if (selector(element).text().trim() === "Extra Small") {
            sizes = "XS";
          } else if (selector(element).text().trim() === "Extra Large") {
            sizes = "XL";
          }
          for (let s of sizesList) {
            if (sizes === s.size) {
              sizeArray.push(s._id);
              break;
            }
          }
        });
      }
      data.sizeArray = sizeArray;
      return data;
    } catch (err) {
      let obj = {
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
  async partsOfProduct(selector, metadata) {
    try {
      let gown,
        shirt,
        dupatta,
        trouser,
        shalwar,
        pants,
        pieces,
        dress,
        scraf,
        productTitle;
      if (
        metadata.title.toLowerCase().includes("gown") ||
        metadata.detailDescription.toLowerCase().includes("gown")
      ) {
        productTitle = "gown";
        pieces = JSON.parse(process.env.pieces)[1];
        gown = true;

        if (
          metadata.title.toLowerCase().includes("shirt") ||
          metadata.detailDescription.toLowerCase().includes("shirt")
        ) {
          productTitle = "gown suit";
          pieces = JSON.parse(process.env.pieces)[3];
          shirt = true;
          if (
            metadata.title.toLowerCase().includes("trouser") ||
            metadata.detailDescription.toLowerCase().includes("trouser")
          ) {
            trouser = true;
            pieces = JSON.parse(process.env.pieces)[3];
          } else if (
            metadata.title.toLowerCase().includes("pant") ||
            metadata.detailDescription.toLowerCase().includes("pant")
          ) {
            pants = true;
            pieces = JSON.parse(process.env.pieces)[3];
          } else if (
            metadata.title.toLowerCase().includes("shalwar") ||
            metadata.detailDescription.toLowerCase().includes("shalwar")
          ) {
            shalwar = true;
            pieces = JSON.parse(process.env.pieces)[3];
          }
        }
      } else if (
        metadata.title.toLowerCase().includes("kurta") ||
        metadata.detailDescription.toLowerCase().includes("kurta") ||
        metadata.detailDescription.toLowerCase().includes("kurti") ||
        metadata.title.toLowerCase().includes("kurti")
      ) {
        productTitle = "kurti";
        pieces = JSON.parse(process.env.pieces)[1];
        shirt = true;
      } else if (
        metadata.title.toLowerCase().includes("shirt") ||
        metadata.detailDescription.toLowerCase().includes("shirt")
      ) {
        pieces = JSON.parse(process.env.pieces)[1];
        shirt = true;
        productTitle = "shirt";
        if (
          metadata.title.toLowerCase().includes("dupatta") ||
          metadata.detailDescription.toLowerCase().includes("dupatta")
        ) {
          productTitle = "suit";
          dupatta = true;
          pieces = JSON.parse(process.env.pieces)[2];
          if (
            metadata.title.toLowerCase().includes("trouser") ||
            metadata.detailDescription.toLowerCase().includes("trouser")
          ) {
            trouser = true;
            pieces = JSON.parse(process.env.pieces)[3];
          } else if (
            metadata.title.toLowerCase().includes("pant") ||
            metadata.detailDescription.toLowerCase().includes("pant")
          ) {
            pants = true;
            pieces = JSON.parse(process.env.pieces)[3];
          } else if (
            metadata.title.toLowerCase().includes("shalwar") ||
            metadata.detailDescription.toLowerCase().includes("shalwar")
          ) {
            shalwar = true;
            pieces = JSON.parse(process.env.pieces)[3];
          }
        } else if (
          metadata.title.toLowerCase().includes("trouser") ||
          metadata.detailDescription.toLowerCase().includes("trouser")
        ) {
          trouser = true;
          pieces = JSON.parse(process.env.pieces)[2];
        } else if (
          metadata.title.toLowerCase().includes("pant") ||
          metadata.detailDescription.toLowerCase().includes("pant")
        ) {
          pants = true;
          pieces = JSON.parse(process.env.pieces)[2];
        } else if (
          metadata.title.toLowerCase().includes("shalwar") ||
          metadata.detailDescription.toLowerCase().includes("shalwar")
        ) {
          shalwar = true;
          pieces = JSON.parse(process.env.pieces)[2];
        }
      } else if (
        metadata.title.toLowerCase().includes("scraf") ||
        metadata.detailDescription.toLowerCase().includes("scraf")
      ) {
        productTitle = "scraf";
        scraf = true;
        pieces = JSON.parse(process.env.pieces)[1];
      } else if (
        metadata.title.toLowerCase().includes("dupatta") ||
        metadata.detailDescription.toLowerCase().includes("dupatta")
      ) {
        productTitle = "dupatta";
        dupatta = true;
        pieces = JSON.parse(process.env.pieces)[1];
      } else if (
        metadata.title.toLowerCase().includes("trouser") ||
        metadata.detailDescription.toLowerCase().includes("trouser")
      ) {
        productTitle = "trouser";
        trouser = true;
        pieces = JSON.parse(process.env.pieces)[1];
      } else if (
        metadata.title.toLowerCase().includes("pant") ||
        metadata.detailDescription.toLowerCase().includes("pant")
      ) {
        productTitle = "pants";
        pants = true;
        pieces = JSON.parse(process.env.pieces)[1];
      } else if (
        metadata.title.toLowerCase().includes("shalwar") ||
        metadata.detailDescription.toLowerCase().includes("shalwar")
      ) {
        productTitle = "shalwar";
        shalwar = true;
        pieces = JSON.parse(process.env.pieces)[1];
      }

      metadata.shalwar = shalwar;
      metadata.trouser = trouser;
      metadata.shirt = shirt;
      metadata.dress = dress;
      metadata.dupatta = dupatta;
      metadata.scraf = scraf;
      metadata.pant = pants;
      metadata.pieces = pieces;
      metadata.productTitle = productTitle;
      return metadata;
    } catch (err) {
      let obj = {
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
  async partsOfMenProduct(selector, metadata) {
    try {
      let kurta, shalwar, kameez, trouser, pieces, productTitle;

      if (
        metadata.title.toLowerCase().includes("kurta") ||
        metadata.detailDescription.toLowerCase().includes("kurta")
      ) {
        productTitle = "kurta";
        pieces = JSON.parse(process.env.pieces)[1];
        kurta = true;
      }
      if (
        metadata.title.toLowerCase().includes("kameez") ||
        metadata.detailDescription.toLowerCase().includes("kameez")
      ) {
        productTitle = "kameez";
        pieces = JSON.parse(process.env.pieces)[1];
        kameez = true;
        if (
          metadata.title.toLowerCase().includes("shalwar") ||
          metadata.detailDescription.toLowerCase().includes("shalwar")
        ) {
          productTitle = "suit";
          pieces = JSON.parse(process.env.pieces)[2];
          shalwar = true;
        } else if (
          metadata.title.toLowerCase().includes("trouser") ||
          metadata.detailDescription.toLowerCase().includes("trouser")
        ) {
          productTitle = "suit";
          pieces = JSON.parse(process.env.pieces)[2];
          trouser = true;
        }
      } else if (
        metadata.title.toLowerCase().includes("trouser") ||
        metadata.detailDescription.toLowerCase().includes("trouser")
      ) {
        productTitle = "trouser";
        pieces = JSON.parse(process.env.pieces)[1];
        trouser = true;
      } else if (
        metadata.title.toLowerCase().includes("shalwar") ||
        metadata.detailDescription.toLowerCase().includes("shalwar")
      ) {
        productTitle = "shalwar";
        pieces = JSON.parse(process.env.pieces)[1];
        shalwar = true;
      }

      metadata.shalwar = shalwar;
      metadata.trouser = trouser;
      metadata.kameez = kameez;
      metadata.kurta = kurta;
      metadata.pieces = pieces;
      metadata.productTitle = productTitle;
      return metadata;
    } catch (err) {
      let obj = {
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
  async metaData(selector) {
    try {
      let productTitle = selector('meta[property="og:title"]').attr("content");
      let description = selector('meta[name="description"]').attr("content");
      let detailDescription = selector('meta[property="og:description"]').attr(
        "content"
      );
      let url = selector('meta[property="og:url"]').attr("content");
      let obj = new Object();
      let picturesArray = [];
      let images = selector('meta[property="og:image"]');
      selector(images).each(async (i, element) => {
        if (parseInt(i) === 0) {
          obj.main = true;
        } else {
          obj.main = false;
        }
        obj.pictureLink = selector(element).attr("content");
        picturesArray.push({ ...obj });
      });

      let emb;
      if (
        productTitle.toLowerCase().includes("embroid") ||
        productTitle.includes("EMB") ||
        detailDescription.toLowerCase().includes("embroid")
      ) {
        emb = true;
      }

      let sku = selector("body")
        .find("#product-description #AddToCartForm .variant-sku")
        .text()
        .trim();
      let object = {
        title: productTitle,
        description: description,
        detailDescription: detailDescription,
        url: url,
        emb: emb,
        sku: sku,
        pictures: picturesArray,
      };
      return object;
    } catch (err) {
      let obj = {
        error: JSON.parse(err),
      };
      await strapi.api.error.services.error.create(obj);
    }
  },
};
