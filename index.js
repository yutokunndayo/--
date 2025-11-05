/* === index.js（バックエンド サーバー） === */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // CORSライブラリ

const app = express();
app.use(express.json()); // JSONリクエストを解析
app.use(cors()); // CORSを有効にする

const JWT_SECRET = 'your-very-strong-secret-key'; // (ここは後で変更)

// === 1. データベースの準備 ===
const db = new sqlite3.Database('./pilgrimage.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the pilgrimage.db database.');
});

// === 2. データベースのテーブル作成 ===
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

  // 聖地巡礼マップ（手帖）テーブル
  db.run(`CREATE TABLE IF NOT EXISTS pilgrimages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    user_id INTEGER,
    work_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (work_id) REFERENCES works (id)
  )`);

  // スポット（場所）テーブル
  db.run(`CREATE TABLE IF NOT EXISTS spots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pilgrimage_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    spot_order INTEGER,
    FOREIGN KEY (pilgrimage_id) REFERENCES pilgrimages (id)
  )`);

  console.log('データベースのテーブルを初期化（または確認）しました。');
});


// === 3. 認証API (登録・ログイン) ===
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('情報が不足');
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash],
      function (err) {
        if (err) return res.status(500).send('登録失敗');
        res.status(201).send(`ユーザー ${username} 登録完了`);
      }
    );
  } catch (err) {
    res.status(500).send('サーバーエラー');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) return res.status(401).send('認証失敗');
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (isMatch) {
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'ログイン成功', token: token });
    } else {
      res.status(401).send('認証失敗');
    }
  });
});


// === 4. 聖地巡礼マップAPI ===

/**
 * GET /api/pilgrimages
 * 聖地巡礼マップの一覧を取得するAPI (DBから取得)
 */
app.get('/api/pilgrimages', (req, res) => {
  console.log('--- APIが叩かれました: GET /api/pilgrimages (DBから取得) ---');

  // pilgrimagesテーブルとworksテーブルをJOIN(結合)
  const sql = `
    SELECT 
      p.id, 
      p.title, 
      w.title AS work 
    FROM pilgrimages p
    JOIN works w ON p.work_id = w.id
    ORDER BY p.id DESC 
  `; // 新しい順に並べる

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'DBエラー (pilgrimages/get)' });
      return;
    }
    console.log(`DBから ${rows.length} 件のマップを取得しました。`);
    res.json(rows); // 取得したデータ (rows) をReactにJSONとして返す
  });
});

/**
 * POST /api/pilgrimages
 * 新しい聖地巡礼マップを作成するAPI (DBへ保存)
 */
app.post('/api/pilgrimages', (req, res) => {
  const { workTitle, mapTitle, spots } = req.body;

  console.log('--- APIが叩かれました: POST /api/pilgrimages ---');
  console.log('受信したデータ:', { workTitle, mapTitle, spots });

  db.serialize(() => {
    
    // 1. 作品 (works) テーブルの処理
    db.get('SELECT id FROM works WHERE title = ?', [workTitle], function(err, row) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'DBエラー (works/get)' });
      }
      if (row) {
        console.log(`作品「${workTitle}」は既存 (ID: ${row.id})`);
        insertPilgrimage(row.id); // 既存IDでステップ2へ
      } else {
        db.run('INSERT INTO works (title) VALUES (?)', [workTitle], function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'DBエラー (works/insert)' });
          }
          console.log(`作品「${workTitle}」を新規追加 (ID: ${this.lastID})`);
          insertPilgrimage(this.lastID); // 新規IDでステップ2へ
        });
      }
    });

    // 2. 聖地巡礼マップ (pilgrimages) テーブルの処理
    function insertPilgrimage(workId) {
      db.run(
        'INSERT INTO pilgrimages (title, work_id, user_id) VALUES (?, ?, ?)',
        [mapTitle, workId, null], // user_id は今は null
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'DBエラー (pilgrimages/insert)' });
          }
          const newPilgrimageId = this.lastID;
          console.log(`マップ「${mapTitle}」を新規追加 (ID: ${newPilgrimageId})`);
          insertSpots(newPilgrimageId); // ステップ3へ
        }
      );
    }

    // 3. スポット (spots) テーブルの処理
    function insertSpots(pilgrimageId) {
      console.log(`スポット ${spots.length} 件の挿入を開始...`);
      const stmt = db.prepare('INSERT INTO spots (pilgrimage_id, name, latitude, longitude, spot_order) VALUES (?, ?, ?, ?, ?)');
      
      spots.forEach((spot, index) => {
        stmt.run(pilgrimageId, spot.name, spot.lat, spot.lng, index + 1);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'DBエラー (spots/insert)' });
        }
        
        // 4. すべて完了
        console.log('すべてのDB保存処理が完了しました。');
        res.status(201).json({ 
          message: 'マップが正常にデータベースに保存されました',
          pilgrimageId: pilgrimageId 
        });
      });
    }
  }); // db.serialize() の終わり
});


// === 5. サーバー起動 ===
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`バックエンドサーバー起動中 http://localhost:${PORT}`);
});