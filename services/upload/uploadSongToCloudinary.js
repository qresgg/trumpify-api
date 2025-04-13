const { Readable } = require('stream');
const cloudinary = require('cloudinary').v2;

const uploadSongToCloudinary = async (fileBuffer, publicId) => {
    return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'songsOgg',
                resource_type: 'video',
                public_id: publicId,
                format: 'ogg',
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        Readable.from(fileBuffer).pipe(uploadStream);
    });
};

module.exports = { uploadSongToCloudinary };