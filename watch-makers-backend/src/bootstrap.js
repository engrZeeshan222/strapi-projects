const fs = require("fs-extra");
const mime = require("mime-types");
// const set = require("lodash.set");
const slugify = require("slugify");
const axios = require("axios");
const FormData = require("form-data");
const Buffer = require("Buffer");
const stream = require('stream');
const path = require('path');
const promisify = require('util').promisify;
// import fetch from 'node-fetch';

const { brands, watches } = require("../data.json");

async function importBranda() {
  console.log("In brand Scraping");
  for (const brand of brands) {
    let newbrand = await strapi.db.query("api::brand.brand").findOne({
      where: {
        name: brand.Brand,
      },
    });

    if (!newbrand) {
      newbrand = await strapi.db.query("api::brand.brand").create({
        data: { name: brand.Brand, publishedAt: Date.now() },
      });
    }

    if (newbrand) {
      let newfamily = await strapi.db.query("api::family.family").findOne({
        where: {
          name: brand.Family,
        },
      });
      if (!newfamily) {
        newbrand = await strapi.db.query("api::family.family").create({
          data: {
            name: brand.Family,
            brand: newbrand.id,
            // Make sure it's not a draft
            publishedAt: Date.now(),
          },
        });
      }
    }
  }
}
async function getFileDetails(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) reject(err.message);
      resolve(stats);
    });
  });
}
async function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err.message);
      resolve('deleted');
    });
  });
}
async function upload(filePath, saveAs) {
  const stats = await getFileDetails(filePath);
  const fileName = path.parse(filePath).base;

  const res = await strapi.plugins.upload.services.upload.upload({
    data: { path: saveAs },
    files: {
      path: filePath,
      name: fileName,
      type: mime.lookup(filePath),
      size: stats.size,
    },
  })
  await deleteFile(filePath);
  return _.first(res);
}
async function importWatches() {
  for (const watch of watches) {
  // const slug = slugify(watch.Name);
  let newWatch = await strapi.db
    .query("api::watches-archive.watches-archive")
    .findOne({
      where: {
        name:watch.Name
      },
    });
  if (!newWatch) {
    let brand = await strapi.db.query("api::brand.brand").findOne({
      where: {
        name: watch.Brand,
      },
    });
    if (!brand) {
      brand = await strapi.db.query("api::brand.brand").create({
        data: { name: watch.Brand, publishedAt: Date.now() },
      });
    }
    let family = await strapi.db.query("api::family.family").findOne({
      where: {
        name: watch.Family,
      },
    });
    if (!family) {
      family = await strapi.db.query("api::family.family").create({
        data: { name: watch.Family, publishedAt: Date.now() },
      });
    }

    const newWatchObject = {
      data: {
        brand: brand.id,
        family: family.id,
        reference: watch.Reference,
        name: watch.Name,
        movement: watch.Movement,
        productionYear: watch.Produced,
        limited: watch.Limited == "No" ? false : true,
        bezelMaterial: watch.Material,
        caseGlass: watch.Glass,
        back: watch.Back,
        shape: watch.Shape,
        diameter: Number(watch.Diameter.split(" ")[0]),
        lugWidth: Number(watch["Lug Width"].split(" ")[0]),
        color: watch.Color,
        hand: watch.Hands,
        description: watch.Description,
        waterResistence: Number(watch["W / R"].split(" ")[0]),
        onSale:watch.onSale ? watch.onsale : null,
        focusKeyPhrase:watch.focusKeyPhrase ? watch.focusKeyPhrase : null,
        seoTitle:watch.seoTitle ? watch.seoTitle : null,
        originalPrice:watch.originalPrice ? watch.originalPrice : null,
        averageRating:watch.averageRating ? watch.averageRating : null,
        salePrice:watch.salePrice ? watch.salePrice : null,
        publishedAt:Date.now()
      },
    };
    newWatch = await strapi.db
      .query("api::watches-archive.watches-archive")
      .create(newWatchObject);

    const arrayImages = watch.Immagine.split("|");
    // console.log({ arrayImages });

//     for (const image of arrayImages) {
//       const filePath = './tmp/myImage.jpeg';

//       const { data } = await axios.get(image, {
//         responseType: 'stream',
//       });
//       const file = fs.createWriteStream(filePath);
//       const finished = promisify(stream.finished);
//       data.pipe(file);
//       await finished(file);
//       const newimage= await upload(filePath, 'uploads');
// console.log({newimage});
                  
//       // await strapi.plugins.upload.services.upload.upload({
//       //     data:response.data, //mandatory declare the data(can be empty), otherwise it will give you an undefined error.

//       // });

//       }
    // }
  }
  else{
    const data = await strapi.db.query("api::watches-archive.watches-archive").update({
      where: { id: Number(newWatch.id) },
      data: { publishedAt:Date.now()},
    });
  }
  }
  // }
}
module.exports = async () => {
  const shouldImportSeedData = await importBranda();
  const importWatch = await importWatches();
};
