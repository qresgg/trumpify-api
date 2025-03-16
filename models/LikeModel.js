const likeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    track: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
    likedAt: { type: Date, default: Date.now }
});

likeSchema.index({ user: 1, track: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);
  