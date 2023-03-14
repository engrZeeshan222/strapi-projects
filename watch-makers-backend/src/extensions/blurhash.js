// // ./src/extensions/blurhash.js
// const plaiceholder = require("plaiceholder");
// const _ = require("lodash");

// module.exports = {
//   generatePlaceholder(strapi) {
//     strapi.contentType("plugin::upload.file").attributes.placeholder = {
//       type: "text",
//     };

//     strapi.plugin("upload").services.upload.uploadFileAndPersist =
//       async function (fileData, { user } = {}) {
//         const config = strapi.config.get("plugin.upload");

//         console.log("--------------Upload File Data Here--------- ", fileData);
//         fileData.ext = ".webp";
//         console.log(
//           "--------------Upload File Data Here With Changes--------- ",
//           fileData
//         );
//         const {
//           getDimensions,
//           generateThumbnail,
//           generateResponsiveFormats,
//           isSupportedImage,
//         } = strapi.plugin("upload").service("image-manipulation");

//         await strapi.plugin("upload").service("provider").upload(fileData);

//         if (await isSupportedImage(fileData)) {
//           let thumbnailFile = await generateThumbnail(fileData);
//           console.log("Thumbnail Image Data", thumbnailFile);
//           thumbnailFile.ext = "webP";
//           console.log("Extension...", thumbnailFile);
//           //   const thumbnailFile1 = await generateWebpFormat(fileData);
//           //   console.log("WebP File Data.....", thumbnailFile1);

//           if (thumbnailFile) {
//             await strapi
//               .plugin("upload")
//               .service("provider")
//               .upload(thumbnailFile);

//             try {
//               await plaiceholder
//                 .getPlaiceholder(thumbnailFile.url)
//                 .then(({ base64 }) => {
//                   fileData.placeholder = base64;
//                 });
//             } catch (e) {
//               fileData.placeholder = "";
//             }

//             delete thumbnailFile.buffer;
//             _.set(fileData, "formats.thumbnail", thumbnailFile);
//           }
//           console.log(".............File Data...............");

//           //////////////////////////////////////////////////////////////
//           const formats = await generateResponsiveFormats(fileData);
//           if (Array.isArray(formats) && formats.length > 0) {
//             for (const format of formats) {
//               if (
//                 !format ||
//                 !(
//                   Array.isArray(format) &&
//                   format.length > 0 &&
//                   format[0] !== undefined
//                 )
//               )
//                 continue;
//               console.log("////////////////Format///////////", format);
//               for (const { key, file } of format) {
//                 await strapi.plugins.upload.provider.upload(file);
//                 delete file.buffer;
//                 // "key" is here as "small", "medium", "large"...
//                 if (!fileFormats.hasOwnProperty(key)) {
//                   fileFormats[key] = [];
//                 }
//                 // "file" is created format. "png", "jpeg", "webp"...
//                 fileFormats[key].push(file);
//               }
//             }
//           }
//           //////////////////////////////////////////////////////////////

//           //   const formats = await generateResponsiveFormats(fileData);

//           //   if (Array.isArray(formats) && formats.length > 0) {
//           //     for (const format of formats) {
//           //       if (!format) {
//           //         continue;
//           //       }

//           //       const { key, file } = format;

//           //       strapi.plugin("upload").service("provider").upload(file);

//           //       _.set(fileData, ["formats", key], file);
//           //     }
//           //   }

//           const { width, height } = await getDimensions(fileData);

//           _.assign(fileData, {
//             provider: config.provider,
//             width,
//             height,
//           });
//         }

//         return this.add(fileData, { user });
//       };
//   },
// };
