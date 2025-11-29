const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
const ARTISTBIO_REGEX = /^[a-zA-Zа-яА-ЯёЁїЇіІєЄґҐ0-9.,!?():;\s'-]{1,1000}$/;


const isValidEmail = (email) => EMAIL_REGEX.test(email);
const isValidPassword = (password) => PASSWORD_REGEX.test(password);
const isValidUserName = (username) => USERNAME_REGEX.test(username);
const isValidBio = (bio) => ARTISTBIO_REGEX.test(bio);

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidUserName,
    isValidBio
}