const bcrypt = require('bcrypt');

const verifyPassword = async (takenPass, userPass, res) => {
    const result = await bcrypt.compare(takenPass, userPass);
    if (!result) {
        throw Error('incorrect password');
    }
    return result;
}

const createPassword = async (password) => {
    const result = await bcrypt.hash(password, 10);
    return result;
}

module.exports = { verifyPassword, createPassword };