const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// 画像公開設定
app.use('/uploads', express.static('uploads'));

// uploadsフォルダ作成
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const JWT_SECRET = 'your-very-strong-secret-key';

// === 1. 画像保存の設定 ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // 文字化け対策
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
// ★重要: 複数ファイルを受け取る設定に変更
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
  db.run(`CREATE TABLE IF NOT EXISTS pilgrimages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    user_id INTEGER,
    work_id INTEGER,
    image_path TEXT, 
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (work_id) REFERENCES works (id)
  )`);
  
  // ★変更: address, nearby_info, image_path を追加
  db.run(`CREATE TABLE IF NOT EXISTS spots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pilgrimage_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    spot_order INTEGER,
    nearby_info TEXT,
    image_path TEXT,
    address TEXT, 
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
app.get('/api/works', (req, res) => {
  const sql = `
    SELECT w.id, w.title, COUNT(p.id) as count 
    FROM works w
    LEFT JOIN pilgrimages p ON w.id = p.work_id
    GROUP BY w.id HAVING count > 0 ORDER BY count DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DBエラー' });
    res.json(rows);
  });
});

app.get('/api/pilgrimages', (req, res) => {
  const sql = `SELECT p.id, p.title, p.image_path, w.title AS work FROM pilgrimages p JOIN works w ON p.work_id = w.id ORDER BY p.id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DBエラー' });
    res.json(rows);
  });
});

app.get('/api/pilgrimages/:id', (req, res) => {
  const mapId = req.params.id;
  const sqlMap = `
    SELECT p.id, p.title AS mapTitle, p.image_path, w.title AS workTitle 
    FROM pilgrimages p JOIN works w ON p.work_id = w.id WHERE p.id = ?
  `;
  db.get(sqlMap, [mapId], (err, map) => {
    if (err || !map) return res.status(404).json({ error: 'マップが見つかりません' });

    const sqlSpots = `SELECT * FROM spots WHERE pilgrimage_id = ? ORDER BY spot_order ASC`;
    db.all(sqlSpots, [mapId], (err, spots) => {
      if (err) return res.status(500).json({ error: 'DBエラー' });
      res.json({ ...map, author: '名無しさん', spots });
    });
  });
});

// ★新規作成: upload.any() を使用
app.post('/api/pilgrimages', upload.any(), (req, res) => {
  let spots = [];
  try { spots = JSON.parse(req.body.spots || '[]'); } catch (e) {}
  
  const workTitle = req.body.workTitle;
  const mapTitle = req.body.mapTitle;

  // カバー画像を探す (frontend: 'coverImage')
  const coverFile = req.files.find(f => f.fieldname === 'coverImage');
  const coverImagePath = coverFile ? coverFile.path.replace(/\\/g, '/') : null;

  console.log('受信:', { workTitle, mapTitle, spotsCount: spots.length });

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
        [mapTitle, workId, null, coverImagePath],
        function(err) {
          if (err) return res.status(500).json({ error: 'DBエラー' });
          insertSpots(this.lastID);
        }
      );
    }

    function insertSpots(pilgrimageId) {
      const stmt = db.prepare('INSERT INTO spots (pilgrimage_id, name, latitude, longitude, spot_order, nearby_info, image_path, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      
      spots.forEach((spot, index) => {
        // スポットごとの画像を探す (frontend: 'spotImage_0', 'spotImage_1'...)
        const spotFile = req.files.find(f => f.fieldname === `spotImage_${index}`);
        const spotImagePath = spotFile ? spotFile.path.replace(/\\/g, '/') : null;

        stmt.run(
          pilgrimageId, 
          spot.name, 
          spot.lat, 
          spot.lng, 
          index + 1, 
          spot.nearbyInfo || '', 
          spotImagePath,
          spot.address || ''
        );
      });
      
      stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: 'DBエラー' });
        res.status(201).json({ message: '保存完了', pilgrimageId });
      });
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));