const buildUserData = (user, count) => {
  return {
        _id: user._id,
        definition: user.definition,
        user_avatar_url: user.url_avatar,
        user_name: user.user_name,
        user_email: user.email,
        user_library: user.library_collection,
        user_likedSongsCount: count
  };
}

const buildUserForeignData = (user, editPermission) => {
  return {
    _id: user._id,
    definition: user.definition,
    user_avatar_url: user.url_avatar,
    user_name: user.user_name,
    edit_permission: editPermission
  };
}

const buildArtistData = (artist) => {
  if (!artist) return 'none';

  return {
    _id: artist._id,
    definition: artist.definition,
    artist_name: artist.name,
    artist_is_verified: artist.is_verified,
    artist_avatar: artist.artist_avatar,
    artist_banner: artist.artist_banner,
    artist_bio: artist.bio,
    artist_region: artist.region
  };
}

const buildArtistForeignData = (artist) => {
  if (!artist) return 'none';

  return {
    _id: artist._id,
    definition: artist.definition,
    artist_name: artist.name,
    artist_is_verified: artist.is_verified,
    artist_avatar: artist.artist_avatar,
    artist_banner: artist.artist_banner,
    artist_bio: artist.bio,
    artist_region: (artist.region && artist.region.privacy === 'public') ? artist.region.region : 'private',
  };
}

const buildAlbumData = (album) => {
    
}

const buildSongData = (song) => {

}

const buildLikedCollection = (collection, songs, name) => {
  return {
    _id: collection._id,
      type: "Collection",
    title: 'Liked Songs',
    user_id: collection._id,
      user_name: name,
    privacy_type: collection.privacy_type,
    songs: songs
  }
}

module.exports = {
    buildArtistData,
    buildArtistForeignData,
    buildUserData,
    buildUserForeignData,
    buildLikedCollection,
}