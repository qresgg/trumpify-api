const User = require('../models/User/UserModel');
const bcrypt = require('bcrypt');

const changePassword = async (req, res) => {
    try {
        const { password } = req.body;

        const userId = req.user.id;
        const user = await User.findById( userId ); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const hashedPassword = await bcrypt.hash(password, 10); 

        user.password_hash = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Usedr data uspdated successfully' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const changeEmail = async (req, res) => {
    try {
        const { email, newEmail } = req.body;

        const userId = req.user.id;
        const user = await User.findById( userId );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (email !== user.email) {
            return res.status(400).json({ message: 'Emails do not match' });
        }

        user.email = newEmail;
        await user.save();
        res.status(200).json({ message: 'Usedr data uspdated successfully' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

const changeUserName = async (req, res) => {
    try {
        const { userName } = req.body;
        const userId = req.user.id;
        const user = await User.findById( userId );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.user_name = userName;
        await user.save();
        res.status(200).json({ message: 'User data updated successfully', username: user.user_name, avatarUrl: user.url_avatar  });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

const uploadAvatar = async (req, res) => {
    try {
        if (!req.cloudinaryResult) {
            return res.status(400).json({ error: "Avatar upload failed" });
        }

        const { public_id: newPublicId, secure_url: newAvatarUrl } = req.cloudinaryResult;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            message: "Avatar uploaded successfully",
            public_id: newPublicId,
            avatarUrl: newAvatarUrl,
        });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        res.status(500).json({ error: "Failed to upload avatar" });
    }
};

module.exports = { changePassword, changeEmail, changeUserName, uploadAvatar};
