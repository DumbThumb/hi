const express = require('express');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Update clip rank
app.patch('/clips/:id/rank', (req, res) => {
  const id = req.params.id;
  const { rank } = req.body;
  if (typeof rank !== 'number') {
    return res.status(400).json({ error: 'rank must be a number' });
  }
  db.run('UPDATE clips SET rank = ? WHERE id = ?', [rank, id], function (err) {
    if (err) return res.status(500).json({ error: 'database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'clip not found' });
    res.json({ id: Number(id), rank });
  });
});

// Helper route to list clips
app.get('/clips', (req, res) => {
  db.all('SELECT * FROM clips ORDER BY rank DESC, id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'database error' });
    res.json(rows);
  });
});

// Helper to create new clip
app.post('/clips', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  db.run('INSERT INTO clips (title) VALUES (?)', [title], function (err) {
    if (err) return res.status(500).json({ error: 'database error' });
    res.status(201).json({ id: this.lastID, title, rank: 0 });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
