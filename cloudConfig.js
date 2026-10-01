const cloudinary = require("cloudinary").v2;
const { PassThrough } = require("stream");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = {
    _handleFile(req, file, cb) {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "wanderlust_DEV",
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    return cb(error);
                }

                cb(null, {
                    path: result.secure_url,
                    filename: result.public_id,
                });
            }
        );

        file.stream.pipe(uploadStream);
    },

    _removeFile(req, file, cb) {
        if (!file.filename) {
            return cb(null);
        }

        cloudinary.uploader.destroy(file.filename, cb);
    },
};

module.exports = {
    cloudinary,
    storage,
};