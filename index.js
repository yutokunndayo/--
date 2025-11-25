const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer'); // 追加: 画像アップロード用
const path = require('path');     // 追加: パス操作用

const app = express();
app.use(express.json());
app.use(cors());

// ★重要: アップロードされた画像をブラウザから見れるように公開する設定
app.use('/uploads', express.static('uploads'));

const JWT_SECRET = 'your-very-strong-secret-key';

// === 1. 画像保存の設定 (Multer) ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 画像の保存先フォルダ (事前に 'uploads' フォルダを作ってください)
    cb(null, 'uploads/'); 
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
  // ユーザーテーブル
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )`);

  // 作品テーブル
  db.run(`CREATE TABLE IF NOT EXISTS works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE
  )`);

  // ★変更: 画像パス(image_path)を保存するカラムを追加
  db.run(`CREATE TABLE IF NOT EXISTS pilgrimages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    user_id INTEGER,
    work_id INTEGER,
    image_path TEXT, 
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (work_id) REFERENCES works (id)
  )`);

  // スポットテーブル
  db.run(`CREATE TABLE IF NOT EXISTS spots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pilgrimage_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    spot_order INTEGER,
    FOREIGN KEY (pilgrimage_id) REFERENCES pilgrimages (id)
  )`);
  
  console.log('データベースのテーブルを初期化しました。');
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

/**
 * GET /api/pilgrimages
 * マップ一覧を取得 (画像パスも含める)
 */
app.get('/api/pilgrimages', (req, res) => {
  const sql = `
    SELECT 
      p.id, 
      p.title, 
      p.image_path, 
      w.title AS work 
    FROM pilgrimages p
    JOIN works w ON p.work_id = w.id
    ORDER BY p.id DESC 
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'DBエラー' });
    }
    res.json(rows);
  });
});

/**
 * POST /api/pilgrimages
 * マップを新規作成 (画像アップロード対応)
 * upload.single('image') が重要！これで画像ファイルを受け取ります
 */
app.post('/api/pilgrimages', upload.single('image'), (req, res) => {
  // 画像以外のデータは req.body に、画像は req.file に入っています
  console.log('--- POST /api/pilgrimages ---');
  
  // FormDataで送ると、ネストしたオブジェクト(spots)は文字列になるため JSON.parse が必要
  // req.body.spots が存在しない場合の対策もしておく
  let spots = [];
  try {
    spots = JSON.parse(req.body.spots || '[]');
  } catch (e) {
    console.error('JSON parse error:', e);
    return res.status(400).json({ error: 'スポットデータの形式が不正です' });
  }

  const workTitle = req.body.workTitle;
  const mapTitle = req.body.mapTitle;
  
  // 画像があればパスを取得 (Windowsパスの \ を / に置換)
  const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : null;

  console.log('受信データ:', { workTitle, mapTitle, imagePath });

  if (!workTitle || !mapTitle) {
    return res.status(400).json({ error: 'タイトルまたは作品名が不足しています' });
  }

  db.serialize(() => {
    // 1. 作品 (works) 登録
    db.get('SELECT id FROM works WHERE title = ?', [workTitle], function(err, row) {
      if (err) return res.status(500).json({ error: 'DBエラー(works)' });
      
      if (row) {
        insertPilgrimage(row.id);
      } else {
        db.run('INSERT INTO works (title) VALUES (?)', [workTitle], function(err) {
          if (err) return res.status(500).json({ error: 'DBエラー(works insert)' });
          insertPilgrimage(this.lastID);
        });
      }
    });

    // 2. マップ (pilgrimages) 登録
    function insertPilgrimage(workId) {
      db.run(
        'INSERT INTO pilgrimages (title, work_id, user_id, image_path) VALUES (?, ?, ?, ?)',
        [mapTitle, workId, null, imagePath],
        function(err) {
          if (err) return res.status(500).json({ error: 'DBエラー(pilgrimages)' });
          insertSpots(this.lastID);
        }
      );
    }

    // 3. スポット (spots) 登録
    function insertSpots(pilgrimageId) {
      const stmt = db.prepare('INSERT INTO spots (pilgrimage_id, name, latitude, longitude, spot_order) VALUES (?, ?, ?, ?, ?)');
      
      spots.forEach((spot, index) => {
        stmt.run(pilgrimageId, spot.name, spot.lat, spot.lng, index + 1);
      });
      
      stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: 'DBエラー(spots)' });
        res.status(201).json({ message: '保存完了', pilgrimageId: pilgrimageId });
      });
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});