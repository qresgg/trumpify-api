export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;

export const isValidEmail = (email) => EMAIL_REGEX.test(email);
export const isValidPassword = (password) => PASSWORD_REGEX.test(password);
export const isValidUserName = (username) => USERNAME_REGEX.test(username);