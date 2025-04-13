const { Readable } = require('stream');
const cloudinary = require('cloudinary').v2;

const uploadCoverAlbumToCloudinary = async (imageBuffer, publicId) => {
    return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'albumCovers',
                public_id: publicId,
                format: 'png',
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        Readable.from(imageBuffer).pipe(uploadStream);
    });
};

module.exports = { uploadCoverAlbumToCloudinary };