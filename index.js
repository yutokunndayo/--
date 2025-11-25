const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer'); // 画像アップロード用
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// ★重要★ 'uploads' フォルダを公開して、ブラウザから画像を見れるようにする
app.use('/uploads', express.static('uploads'));

const JWT_SECRET = 'your-very-strong-secret-key';

// === 1. 画像アップロードの設定 (Multer) ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // uploadsフォルダに保存
  },
  filename: (req, file, cb) => {
    // ファイル名が被らないように現在時刻を付与
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

  // ★変更★ image_path カラムを追加
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
  
  console.log('データベースの初期化完了');
});

// === 4. 認証API ===
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('情報が不足');
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash], function (err) {
      if (err) return res.status(500).send('登録失敗');
      res.status(201).send(`ユーザー ${username} 登録完了`);
    });
  } catch (err) { res.status(500).send('サーバーエラー'); }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) return res.status(401).send('認証失敗');
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (isMatch) {
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'ログイン成功', token: token });
    } else { res.status(401).send('認証失敗'); }
  });
});

// === 5. 聖地巡礼マップAPI ===

// GET: 一覧取得 (画像パスも含めて取得)
app.get('/api/pilgrimages', (req, res) => {
  const sql = `
    SELECT p.id, p.title, p.image_path, w.title AS work 
    FROM pilgrimages p
    JOIN works w ON p.work_id = w.id
    ORDER BY p.id DESC 
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DBエラー' });
    res.json(rows);
  });
});

// POST: 新規作成 (画像アップロード対応)
// upload.single('image') で画像ファイルを受け取る
app.post('/api/pilgrimages', upload.single('image'), (req, res) => {
  // 画像以外のデータは req.body に、画像は req.file に入る
  // 注意: FormDataで送ると、ネストしたオブジェクト(spots)は文字列になるため JSON.parse が必要
  const workTitle = req.body.workTitle;
  const mapTitle = req.body.mapTitle;
  const spots = JSON.parse(req.body.spots); 
  const imagePath = req.file ? req.file.path.replace('\\', '/') : null; // Windows対応のためパス修正

  console.log('受信データ:', { workTitle, mapTitle, imagePath });

  db.serialize(() => {
    // 1. 作品登録
    db.get('SELECT id FROM works WHERE title = ?', [workTitle], function(err, row) {
      if (err) return res.status(500).json({ error: 'DBエラー' });
      if (row) {
        insertPilgrimage(row.id);
      } else {
        db.run('INSERT INTO works (title) VALUES (?)', [workTitle], function(err) {
          if (err) return res.status(500).json({ error: 'DBエラー' });
          insertPilgrimage(this.lastID);
        });
      }
    });

    // 2. マップ登録 (画像パスも保存)
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

    // 3. スポット登録
    function insertSpots(pilgrimageId) {
      const stmt = db.prepare('INSERT INTO spots (pilgrimage_id, name, latitude, longitude, spot_order) VALUES (?, ?, ?, ?, ?)');
      spots.forEach((spot, index) => {
        stmt.run(pilgrimageId, spot.name, spot.lat, spot.lng, index + 1);
      });
      stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: 'DBエラー' });
        res.status(201).json({ message: '保存完了', pilgrimageId: pilgrimageId });
      });
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});