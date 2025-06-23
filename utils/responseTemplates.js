const buildUserData = (user, likedCol = {}, first20LikedSongs = [], libraryItems = []) => {
  return {
    _id: user._id,
    definition: user.definition,
    user_avatar_url: user.url_avatar,
    user_name: user.user_name,
    user_email: user.email,
    user_likedSongsCount: likedCol?.songs?.length || 0,
    user_likedSongsList: first20LikedSongs,
    user_library: libraryItems,
  };
}

const buildUserForeignData = (user) => {
  return {
    _id: user._id,
    definition: user.definition,
    user_avatar_url: user.url_avatar,
    user_name: user.user_name,
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
  };
}

const buildAlbumData = (album) => {
    
}

const buildSongData = (song) => {

}

module.exports = {
    buildArtistData,
    buildUserData,
    buildUserForeignData
}