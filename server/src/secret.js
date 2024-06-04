require('dotenv').config();
const serverPort = process.env.SERVER_PORT || 3002;
const mongodbURL = process.env.MONGO_URL || 'mongodb://localhost:27017/ecommerceMernDB';
const defaultImagePath = process.env.DEFAULT_USER_IMAGE_PATH || 'public/images/users/default.jpg';
const jwtActivationKey = process.env.JWT_ACTIVATION_KEY || 'JADSKLFJIAU43UAJFKLDKL';
const jwtAccessKey = process.env.JWT_ACCESS_KEY || 'JADSKLFJIAU43UAJFKLDKL';
const jwtRefreshKey = process.env.JWT_REFRESH_KEY || 'JADSKLFJIAU43UAJFKLDKL';
const jwtResetPasswordKey = process.env.JWT_RESET_PASSWORD_KEY || 'JADSKLFJIAU43UAJFKLDKL';
const smtpUsername = process.env.SMTP_USERNAME || '';
const smtpPassword = process.env.SMTP_PASSWORD || '';
const clientURL = process.env.CLIENT_URL || '';

module.exports = {serverPort,mongodbURL, defaultImagePath, jwtActivationKey, smtpUsername, smtpPassword, clientURL, jwtAccessKey,jwtResetPasswordKey, jwtRefreshKey };
