const mongoose = require('mongoose')
const cloudinary = require('../middleware/upload.middleware');

const { findUserById } = require("../services/search.main");
const { findArtistById } = require("../services/search.main");
const { findAlbumById } = require("../services/search.main");

const { parseFeatures } = require("../services/useful.fragment");
const { deleteSong } = require("../services/useful.fragment");

const { processCoverImage } = require("../services/upload/processCoverImage");
const { uploadCoverAlbumToCloudinary } = require("../services/upload/uploadCoverAlbumToCloudinary");
const { updateSongWithSong } = require("../services/upload/updateSongBySong");
const { uploadSongToCloudinary } = require("../services/upload/uploadSongToCloudinary");
const { updateAlbumWithCover } = require("../services/upload/updateAlbumByCover");

const { createAlbum } = require("../services/create.main");
const { createSongInAlbum } = require("../services/create.main");

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const createAlbumController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const uploadedCloudinaryAssets = [];

  try {
    console.log("🔄 Album creation started");

    const { albumTitle, recordLabel, language, genre, type, privacy, date } = req.body;
    const userId = req.user.id;

    const user = await findUserById(userId);
    console.log("👤 User found:", user._id);
    const artist = await findArtistById(user.artist_profile);
    console.log("🎨 Artist found:", artist._id);

    const coverFile = req.files.find(file => file.fieldname === 'cover');
    if (!coverFile) throw new Error('Cover image is required');
    console.log("🖼️ Cover file found");

    const newAlbum = await createAlbum(
      { albumTitle, recordLabel, language, genre, type, privacy, date },
      artist,
      session
    );
    console.log("📀 New album created:", newAlbum._id);

    const imageBuffer = await processCoverImage(coverFile.buffer);
    const coverResult = await uploadCoverAlbumToCloudinary(imageBuffer, newAlbum._id);
    if (!coverResult?.public_id) throw new Error("Failed to upload album cover to Cloudinary");

    uploadedCloudinaryAssets.push({ public_id: coverResult.public_id, type: "image" });
    console.log("✅ Cover uploaded to Cloudinary:", coverResult.secure_url);

    await updateAlbumWithCover(newAlbum._id, coverResult.secure_url, session);
    console.log("📝 Album updated with cover");

    const tracks = [];

    if (req.body.songs && Array.isArray(req.body.songs)) {
      console.log(`🎵 ${req.body.songs.length} songs detected`);

      for (let i = 0; i < req.body.songs.length; i++) {
        console.log(`➡️ Processing song #${i + 1}`);

        const songDataRaw = req.body.songs[i];
        const songData = JSON.parse(songDataRaw);

        if (!songData.title) throw new Error(`Song ${i + 1} is missing title`);
        const features = parseFeatures(songData.artists);

        const audioFile = req.files.find(file => file.fieldname === `songs[${i}][audio]`);
        if (!audioFile) throw new Error(`Audio file missing for song ${i + 1}`);

        const allowedTypesSong = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp3'];
        if (!allowedTypesSong.includes(audioFile.mimetype)) {
          throw new Error(`Invalid audio type for song ${i + 1}: ${audioFile.mimetype}`);
        }

        const cleanedGenres = songData.genre.map(({ id, name }) => ({ id, name }));
        const newSong = await createSongInAlbum(songData, features, artist, coverResult.secure_url, date, session, cleanedGenres);
        console.log(`🎶 Created DB record for song: ${newSong._id}`);

        const audioBuffer = audioFile.buffer;
        const audioResult = await uploadSongToCloudinary(audioBuffer, newSong._id);
        if (!audioResult?.public_id) throw new Error(`Failed to upload audio for song ${i + 1}`);

        uploadedCloudinaryAssets.push({ public_id: audioResult.public_id, type: "video" });
        console.log(`⬆️ Song uploaded to Cloudinary: ${audioResult.secure_url}`);

        await updateSongWithSong(newSong._id, audioResult.secure_url, session);

        newSong.song_file = audioResult.secure_url;
        await newSong.save({ session });

        tracks.push(newSong._id);
      }
    } else {
      throw new Error('Invalid songs data');
    }

    newAlbum.songs = tracks;
    await newAlbum.save({ session });
    console.log("📥 Album updated with song references");

    await session.commitTransaction();
    session.endSession();
    console.log("✅ Transaction committed");

    res.status(201).json({
      success: true,
      message: 'Album created successfully'
    });

  } catch (error) {
    console.error("❌ Error occurred:", error.message);
    await session.abortTransaction();
    session.endSession();
    console.log("⛔️ Transaction aborted");

    for (const asset of uploadedCloudinaryAssets) {
      try {
        const result = await cloudinary.uploader.destroy(asset.public_id, {
          resource_type: asset.type
        });
        console.log(`🗑️ Cloudinary asset deleted: ${asset.public_id}, result: ${result.result}`);
      } catch (err) {
        console.error(`❗️ Failed to delete Cloudinary asset ${asset.public_id}:`, err.message);
      }
    }

    res.status(500).json({
      success: false,
      error: isDev ? error.message : 'Something went wrong. Please try again later.'
    });
  }
};

module.exports = { createAlbumController };