const parseFeatures = (artists) => {
    let features = [];

    if (typeof artists === 'string') {
        try {
            const parsedArtists = JSON.parse(artists);
            if (Array.isArray(parsedArtists)) {
                features = parsedArtists.map(artist => ({
                    name: artist.name,
                    roles: Array.isArray(artist.roles)
                        ? artist.roles.flatMap(role => ({ role }))
                        : []
                }));
            }
        } catch (err) {
            throw new Error('Invalid artists format');
        }
    } else if (Array.isArray(artists)) {
        features = artists.map(artist => ({
            name: artist.name,
            roles: Array.isArray(artist.roles)
                ? artist.roles.flatMap(role => ({ role }))
                : []
        }));
    }

    return features;
};

module.exports = { parseFeatures };