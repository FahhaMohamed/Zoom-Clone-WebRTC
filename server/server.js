const app = require("./app");
const http = require("http");
const dotenv = require("dotenv");
const path = require("path");
const connectDatabase = require('./config/database');
const { initSocket } = require("./services/socket.service");

dotenv.config({ path: path.join(__dirname, "./config/config.env") });

connectDatabase();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
