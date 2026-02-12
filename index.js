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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const JWT_SECRET = 'your-very-strong-secret-key';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const db = new sqlite3.Database('./pilgrimage.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS works (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)`);
  db.run(`CREATE TABLE IF NOT EXISTS pilgrimages (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, user_id INTEGER, work_id INTEGER, image_path TEXT, FOREIGN KEY (user_id) REFERENCES users (id), FOREIGN KEY (work_id) REFERENCES works (id))`);
  // ★user_id カラムを含んだ spots テーブル定義
  db.run(`CREATE TABLE IF NOT EXISTS spots (id INTEGER PRIMARY KEY AUTOINCREMENT, pilgrimage_id INTEGER NOT NULL, user_id INTEGER, name TEXT NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL, spot_order INTEGER, nearby_info TEXT, image_path TEXT, address TEXT, FOREIGN KEY (pilgrimage_id) REFERENCES pilgrimages (id), FOREIGN KEY (user_id) REFERENCES users (id))`);
});

// マップ削除API
app.delete('/api/pilgrimages/:id', (req, res) => {
  const mapId = req.params.id;
  db.run('DELETE FROM pilgrimages WHERE id = ?', [mapId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted successfully' });
  });
});

// ★スポット削除API
app.delete('/api/spots/:id', (req, res) => {
  const spotId = req.params.id;
  db.run('DELETE FROM spots WHERE id = ?', [spotId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Spot deleted successfully' });
  });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
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
      res.json({ message: 'ログイン成功', token, userId: user.id, username: user.username });
    } else { res.status(401).send('認証失敗'); }
  });
});

app.get('/api/pilgrimages', (req, res) => {
  const sql = `SELECT p.id, p.title, p.image_path, w.title AS work FROM pilgrimages p JOIN works w ON p.work_id = w.id ORDER BY p.id DESC`;
  db.all(sql, [], (err, rows) => { if (err) return res.status(500).json({ error: 'DBエラー' }); res.json(rows); });
});

// 詳細取得（スポットの投稿者名も取得）
app.get('/api/pilgrimages/:id', (req, res) => {
  const mapId = req.params.id;
  const sql = `
    SELECT p.id, p.title AS mapTitle, p.image_path, w.title AS workTitle, u.username AS author 
    FROM pilgrimages p 
    JOIN works w ON p.work_id = w.id 
    LEFT JOIN users u ON p.user_id = u.id 
    WHERE p.id = ?`;
    
  db.get(sql, [mapId], (err, map) => {
    if (err || !map) return res.status(404).json({ error: 'マップが見つかりません' });
    
    // スポットとユーザー情報を結合して取得
    const spotsSql = `
      SELECT s.*, u.username 
      FROM spots s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE s.pilgrimage_id = ? 
      ORDER BY s.spot_order ASC
    `;
    
    db.all(spotsSql, [mapId], (err, spots) => {
      if (err) return res.status(500).json({ error: 'DBエラー' });
      res.json({ ...map, spots });
    });
  });
});

// マップ新規作成（枠のみ）
app.post('/api/pilgrimages', upload.any(), (req, res) => {
  let spots = [];
  try { spots = JSON.parse(req.body.spots || '[]'); } catch (e) {}
  const { workTitle, mapTitle, userId } = req.body;
  const coverFile = req.files.find(f => f.fieldname === 'coverImage');
  const coverImagePath = coverFile ? coverFile.path.replace(/\\/g, '/') : null;

  db.serialize(() => {
    db.get('SELECT id FROM works WHERE title = ?', [workTitle], function(err, row) {
      if (row) insertPilgrimage(row.id);
      else db.run('INSERT INTO works (title) VALUES (?)', [workTitle], function(err) { insertPilgrimage(this.lastID); });
    });

    function insertPilgrimage(workId) {
      db.run('INSERT INTO pilgrimages (title, work_id, user_id, image_path) VALUES (?, ?, ?, ?)', [mapTitle, workId, userId || null, coverImagePath], function(err) {
        insertSpots(this.lastID);
      });
    }

    function insertSpots(pilgrimageId) {
      // 初期作成時はスポットは空のことが多いが念のため
      const stmt = db.prepare('INSERT INTO spots (pilgrimage_id, user_id, name, latitude, longitude, spot_order, nearby_info, image_path, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      spots.forEach((spot, index) => {
        const spotFile = req.files.find(f => f.fieldname === `spotImage_${index}`);
        const spotImagePath = spotFile ? spotFile.path.replace(/\\/g, '/') : null;
        stmt.run(pilgrimageId, userId, spot.name, spot.lat, spot.lng, index + 1, spot.nearbyInfo || '', spotImagePath, spot.address || '');
      });
      stmt.finalize(() => res.status(201).json({ message: '保存完了', pilgrimageId }));
    }
  });
});

// ユーザーの作成したマップ一覧
app.get('/api/users/:id/pilgrimages', (req, res) => {
  const userId = req.params.id;
  const sql = `SELECT p.id, p.title, p.image_path, w.title AS work FROM pilgrimages p JOIN works w ON p.work_id = w.id WHERE p.user_id = ? ORDER BY p.id DESC`;
  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DBエラー' });
    res.json(rows);
  });
});

// ★ユーザーの投稿したスポット一覧 (マイページ用)
app.get('/api/users/:id/spots', (req, res) => {
  const userId = req.params.id;
  const sql = `
    SELECT s.id, s.name, s.image_path, s.address, p.title AS mapTitle, p.id AS mapId, w.title AS workTitle
    FROM spots s
    JOIN pilgrimages p ON s.pilgrimage_id = p.id
    JOIN works w ON p.work_id = w.id
    WHERE s.user_id = ?
    ORDER BY s.id DESC
  `;
  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DBエラー' });
    res.json(rows);
  });
});

// マップ更新API
app.put('/api/pilgrimages/:id', upload.any(), (req, res) => {
  const mapId = req.params.id;
  const { workTitle, mapTitle } = req.body;
  const coverFile = req.files.find(f => f.fieldname === 'coverImage');
  const coverImagePath = coverFile ? coverFile.path.replace(/\\/g, '/') : undefined;

  db.serialize(() => {
    db.get('SELECT id FROM works WHERE title = ?', [workTitle], function(err, row) {
      if (row) updatePilgrimage(row.id);
      else db.run('INSERT INTO works (title) VALUES (?)', [workTitle], function(err) { updatePilgrimage(this.lastID); });
    });
    function updatePilgrimage(workId) {
      let sql = 'UPDATE pilgrimages SET title = ?, work_id = ?';
      let params = [mapTitle, workId];
      if (coverImagePath) { sql += ', image_path = ?'; params.push(coverImagePath); }
      sql += ' WHERE id = ?';
      params.push(mapId);
      db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '更新完了' });
      });
    }
  });
});

// ★ViewScreenから呼び出す「スポット1件追加」API
app.post('/api/pilgrimages/:id/spots', upload.single('spotImage'), (req, res) => {
  const pilgrimageId = req.params.id;
  const { name, address, nearbyInfo, lat, lng, userId } = req.body; // userIdを受け取る
  
  const spotFile = req.file;
  const spotImagePath = spotFile ? spotFile.path.replace(/\\/g, '/') : null;

  db.serialize(() => {
    db.get('SELECT MAX(spot_order) as maxOrder FROM spots WHERE pilgrimage_id = ?', [pilgrimageId], (err, row) => {
      if (err) return res.status(500).json({ error: 'DBエラー' });
      const nextOrder = (row && row.maxOrder) ? row.maxOrder + 1 : 1;
      
      const stmt = db.prepare('INSERT INTO spots (pilgrimage_id, user_id, name, latitude, longitude, spot_order, nearby_info, image_path, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(pilgrimageId, userId || null, name, lat, lng, nextOrder, nearbyInfo || '', spotImagePath, address || '', function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'スポット追加成功', spotId: this.lastID });
      });
      stmt.finalize();
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));