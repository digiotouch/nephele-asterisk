// server/server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 3000;

// Set up multer for image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Endpoint to handle image upload
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    res.send(`Image received: ${req.file.filename}`);
});

// Endpoint for video upload
app.post('/upload-video', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).send('No video uploaded');
    res.send(`Video saved as: ${req.file.filename}`);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
