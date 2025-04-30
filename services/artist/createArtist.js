const Artist = require("../../models/Artist/ArtistModel");

const createArtist = async (user, artistName, bio) => {
    const newArtist = new Artist({
        user_id: user._id,
        name: artistName,
        bio: bio,
    });
    await newArtist.save();

    user.artist_profile = newArtist._id;
    await user.save();
    return newArtist;
}

module.exports = { createArtist };