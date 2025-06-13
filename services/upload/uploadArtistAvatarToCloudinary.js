const { Readable } = require('stream');
const cloudinary = require('cloudinary').v2;

const uploadArtistAvatarToCloudinary = async (imageBuffer, publicId) => {
    return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'artistAvatars',
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

module.exports = { uploadArtistAvatarToCloudinary };