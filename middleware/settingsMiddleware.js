const User = require('../models/UserModel');
const bcrypt = require('bcrypt');

const changePassword = async (req, res) => {
    try {
        const { password } = req.body;

        const userId = req.user._id;
        const user = await User.findOne({ _id: userId });
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

        const userId = req.user._id;
        const user = await User.findOne({ _id: userId });
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

module.exports = { changePassword, changeEmail};
