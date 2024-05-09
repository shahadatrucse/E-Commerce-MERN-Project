const app = require('./app');
const connectDatabase = require('./config/db');
const { serverPort } = require('./secret');

// server build testing //
app.listen(serverPort, async() => {
    console.log(`server is running at http://localhost:${serverPort}`);
    await connectDatabase();
});
