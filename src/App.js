import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import TitleScreen from './TitleScreen';
import HomeScreen from './HomeScreen';
import PostScreen from './PostScreen';
import ViewScreen from './ViewScreen';
import './App.css'; // 簡単なスタイル用

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* === ヘッダー（ナビゲーションバー） === */}
        <nav>
          <ul>
            <li><Link to="/">タイトル</Link></li>
            <li><Link to="/home">ホーム</Link></li>
            <li><Link to="/post">投稿する</Link></li>
          </ul>
        </nav>

        {/* === ここにページ本体が表示される === */}
        <div className="content">
          <Routes>
            {/* / (ルートパス) にアクセスしたら TitleScreen を表示 */}
            <Route path="/" element={<TitleScreen />} />
            
            {/* /home にアクセスしたら HomeScreen を表示 */}
            <Route path="/home" element={<HomeScreen />} />
            
            {/* /post にアクセスしたら PostScreen を表示 */}
            <Route path="/post" element={<PostScreen />} />
            
            {/* /view/:memoryId (例: /view/1) にアクセスしたら ViewScreen を表示 */}
            <Route path="/view/:memoryId" element={<ViewScreen />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;