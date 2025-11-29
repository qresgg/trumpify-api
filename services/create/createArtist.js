const Artist = require("../../models/artist.model");

const createArtist = async (user, artistName, bio, region) => {
    const newArtist = new Artist({
        user_id: user._id,
        name: artistName,
        bio: bio,
        region: region
    });
    await newArtist.save();

    user.artist_profile = newArtist._id;
    await user.save();
    return newArtist;
}

module.exports = { createArtist };