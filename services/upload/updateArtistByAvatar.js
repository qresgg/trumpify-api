const Artist = require('../../models/artist.model')

const updateArtistWithAvatar = async (artistId, avatarUrl) => {
    const artist = await Artist.findById(artistId);
    if (!artist) {
        throw new Error('User not found');
    }
    artist.artist_avatar = avatarUrl;
    await artist.save();
};

module.exports = { updateArtistWithAvatar };