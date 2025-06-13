const Artist = require('../../models/Artist/ArtistModel')

const updateArtistWithAvatar = async (artistId, avatarUrl) => {
    const artist = await Artist.findById(artistId);
    if (!user) {
        throw new Error('User not found');
    }
    artist.avatar = avatarUrl;
    await artist.save();
};

module.exports = { updateArtistWithAvatar };