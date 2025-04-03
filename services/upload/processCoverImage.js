const sharp = require('sharp')

const processCoverImage = async (fileBuffer) => {
    const imageBuffer = await sharp(fileBuffer)
        .toFormat('png')
        .toBuffer();
    return imageBuffer;
}

module.exports = { processCoverImage }