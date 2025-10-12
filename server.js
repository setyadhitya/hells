// server.js
import fs from "fs";
import https from "https";
import next from "next";
import path from "path";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const __dirname = path.resolve();

const options = {
  key: fs.readFileSync(path.join(__dirname, "cert/localhost-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert/localhost.crt")),
};

app.prepare().then(() => {
  https.createServer(options, (req, res) => {
    handle(req, res);
  }).listen(3000, () => {
    console.log("> Server running at https://localhost:3000");
  });
});
