const http = require('http');
require('dotenv').config();
const app = require('./app');
const logger = require('./utils/loggers');

const server = http.createServer(app);

const PORT = process.env.PORT;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
