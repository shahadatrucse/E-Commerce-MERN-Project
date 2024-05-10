require('dotenv').config();
const serverPort = process.env.SERVER_PORT || 3002;
const mongodbURL = process.env.MONGO_URL || 'mongodb://localhost:27017/ecommerceMernDB';
const defaultImagePath = process.env.DEFAULT_USER_IMAGE_PATH || 'public/images/users/default.jpg';
const jwtActivationKey = process.env.JWT_ACTIVATION_KEY || 'JADSKLFJIAU43UAJFKLDKL';
const smtpUsername = process.env.SMTP_USERNAME || '';
const smtpPassword = process.env.SMTP_PASSWORD || '';
const clientURL = process.env.CLIENT_URL || '';
const uploadDir = process.env.UPLOAD_FILE || 'public/images/users';


module.exports = {serverPort,mongodbURL, defaultImagePath, jwtActivationKey, smtpUsername, smtpPassword, clientURL, uploadDir};
