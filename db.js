const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const PORT = process.env.PORT || 4000;

const app = express();
const uri = 'mongodb+srv://vitalik:damn@spotik.ppxm4.mongodb.net/playlists';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

app.use(cors());

const playlistsDataSchema = new mongoose.Schema({}, { collection: "playlistsData" });
const Playlist = mongoose.model('PlaylistData', playlistsDataSchema);

app.get('/data', async (req, res) => {
  try {
    const result = await Playlist.find();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('error');
  }
});

app.listen(PORT, () => {
  console.log(`server is working on ${PORT}`);
});