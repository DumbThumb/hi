const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

app.use(express.json());

const dbPath = path.join(__dirname, 'clips.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId TEXT NOT NULL,
    filePath TEXT NOT NULL,
    duration INTEGER NOT NULL,
    rank INTEGER DEFAULT 0
  )`);
});

app.post('/clips', upload.single('video'), (req, res) => {
  const { eventId, duration, rank } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'Video file is required' });
  }
  if (!eventId || !duration) {
    return res.status(400).json({ error: 'eventId and duration are required' });
  }

  const filePath = req.file.path;
  const insert = db.prepare('INSERT INTO clips (eventId, filePath, duration, rank) VALUES (?, ?, ?, ?)');
  insert.run(eventId, filePath, parseInt(duration, 10), rank ? parseInt(rank, 10) : 0, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to save clip' });
    }
    res.status(201).json({ id: this.lastID, eventId, filePath, duration: parseInt(duration, 10), rank: rank ? parseInt(rank, 10) : 0 });
  });
  insert.finalize();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

