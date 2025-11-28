const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer'); // 画像用ライブラリ
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// ★重要: 'uploads' フォルダを公開して画像を見れるようにする
app.use('/uploads', express.static('uploads'));

const JWT_SECRET = 'your-very-strong-secret-key';

// === 1. 画像保存の設定 (Multer) ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// === 2. データベースの準備 ===
const db = new sqlite3.Database('./pilgrimage.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to the pilgrimage.db database.');
});

// === 3. テーブル作成 ===
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE
  )`);
  // ★ image_path カラムを追加
  db.run(`CREATE TABLE IF NOT EXISTS pilgrimages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    user_id INTEGER,
    work_id INTEGER,
    image_path TEXT, 
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (work_id) REFERENCES works (id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS spots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pilgrimage_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    spot_order INTEGER,
    FOREIGN KEY (pilgrimage_id) REFERENCES pilgrimages (id)
  )`);
  console.log('データベース初期化完了');
});

// === 4. 認証API ===
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('情報不足');
  try {
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash], function(err) {
      if (err) return res.status(500).send('登録失敗');
      res.status(201).send(`登録完了`);
    });
  } catch (e) { res.status(500).send('エラー'); }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) return res.status(401).send('認証失敗');
    const match = await bcrypt.compare(password, user.password_hash);
    if (match) {
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'ログイン成功', token });
    } else { res.status(401).send('認証失敗'); }
  });
});

// === 5. マップAPI ===
app.get('/api/pilgrimages', (req, res) => {
  const sql = `SELECT p.id, p.title, p.image_path, w.title AS work FROM pilgrimages p JOIN works w ON p.work_id = w.id ORDER BY p.id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DBエラー' });
    res.json(rows);
  });
});

// ★画像アップロード対応のPOST
app.post('/api/pilgrimages', upload.single('image'), (req, res) => {
  // FormData形式で送られてくるため、JSON.parseが必要
  let spots = [];
  try { spots = JSON.parse(req.body.spots || '[]'); } catch (e) {}
  
  const workTitle = req.body.workTitle;
  const mapTitle = req.body.mapTitle;
  const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : null;

  console.log('受信:', { workTitle, mapTitle, imagePath });

  db.serialize(() => {
    db.get('SELECT id FROM works WHERE title = ?', [workTitle], function(err, row) {
      if (err) return res.status(500).json({ error: 'DBエラー' });
      if (row) insertPilgrimage(row.id);
      else {
        db.run('INSERT INTO works (title) VALUES (?)', [workTitle], function(err) {
          if (err) return res.status(500).json({ error: 'DBエラー' });
          insertPilgrimage(this.lastID);
        });
      }
    });

    function insertPilgrimage(workId) {
      db.run(
        'INSERT INTO pilgrimages (title, work_id, user_id, image_path) VALUES (?, ?, ?, ?)',
        [mapTitle, workId, null, imagePath],
        function(err) {
          if (err) return res.status(500).json({ error: 'DBエラー' });
          insertSpots(this.lastID);
        }
      );
    }

    function insertSpots(pilgrimageId) {
      const stmt = db.prepare('INSERT INTO spots (pilgrimage_id, name, latitude, longitude, spot_order) VALUES (?, ?, ?, ?, ?)');
      spots.forEach((spot, index) => stmt.run(pilgrimageId, spot.name, spot.lat, spot.lng, index + 1));
      stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: 'DBエラー' });
        res.status(201).json({ message: '保存完了', pilgrimageId });
      });
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));