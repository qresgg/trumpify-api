const bcrypt = require('bcrypt');

const verifyPassword = async (takenPass, userPass) => {
    const result = await bcrypt.compare(takenPass, userPass);
    if (!result) {
        return res.status(400).json({ message: 'incorrect password' });
    }
    return result;
}

const createPassword = async (password) => {
    const result = await bcrypt.hash(password, 10);
    return result;
}

module.exports = { verifyPassword, createPassword };