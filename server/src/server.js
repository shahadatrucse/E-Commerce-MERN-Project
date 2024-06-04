const app = require('./app');
const connectDatabase = require('./config/db');
const logger = require('./controllers/loggerController');
const { serverPort } = require('./secret');

// server build testing //
app.listen(serverPort, async() => {
    logger.log('info',`server is running at http://localhost:${serverPort}`);
    await connectDatabase();
});
