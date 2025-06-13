const { Readable } = require('stream');
const cloudinary = require('cloudinary').v2;

const uploadAvatarToCloudinary = async (imageBuffer, publicId) => {
    return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'userAvatars',
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

module.exports = { uploadAvatarToCloudinary };