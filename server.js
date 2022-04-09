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

// Routes
app.use('/data', express.static("data"));
app.use('/', express.static(path.join("frontend", "build")));

 // Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});