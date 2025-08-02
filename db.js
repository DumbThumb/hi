const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    rank INTEGER DEFAULT 0
  )`);
});

module.exports = db;
