const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const port = 3004;

// Setup CORS
app.use(cors());

// Ensure the upload directory exists
const directory = path.join(__dirname, 'public/images');
if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory, { recursive: true });
}

// Function to hash the image
const hashImage = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

// Function to check if image exists
const imageExists = (hash) => {
  const filePath = path.join(directory, hash + '.jpg');
  return fs.existsSync(filePath);
};

// Setup storage for uploaded files
const storage = multer.memoryStorage();

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Generate hash for the uploaded image
  const imageHash = hashImage(req.file.buffer);

  if (imageExists(imageHash)) {
    return res.json({ fileName: imageHash + '.jpg' });
  }

  const filePath = path.join(directory, imageHash + '.jpg');
  fs.writeFile(filePath, req.file.buffer, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error saving file' });
    }
    res.json({ fileName: imageHash + '.jpg' });
  });
});

app.use('/images', express.static(directory));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
