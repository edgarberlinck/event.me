// healthcheck.js
const http = require("node:http");
const options = {
  host: "localhost",
  port: 3000,
  path: "/api/health",
  timeout: 2000,
};

const request = http.request(options, (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});

request.on("error", () => {
  process.exit(1);
});

request.end();
