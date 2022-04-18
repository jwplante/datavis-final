/**
 * CS573 Basic HTTP server
 * James Plante (jplante@wpi.edu)
 */
import 'dotenv/config';
import express from "express";
import path from "path";

// Initialize express and libraries
const app = express();
const port = Number(process.env.PORT_NUMBER);

// Logger
const logRequest = (req, res, next) => {
  console.log(`[INFO] New request from ${req.ip} for URL ${req.originalUrl}, method ${req.method}`)
  next()
};

// Routes
app.use('/data', express.static("data"), logRequest);
app.use('/', express.static(path.join("frontend", "build")), logRequest);


 // Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});