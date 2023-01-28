const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "dxy0fr9yu",
  api_key: 729881695894599,
  api_secret: "iQLHhe3p7GDeb9qxVufzYLMO_G8",
})
exports.uploads = (file) => {
    return new Promise((resolve) => {
      cloudinary.uploader.upload(
        file,
        (result) => {
          resolve({ url: result.url, id: result.public_id });
        },
        { resource_type: "auto" }
      );
    });
  };

module.exports = cloudinary;