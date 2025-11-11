import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import TitleScreen from './TitleScreen.jsx';
import HomeScreen from './HomeScreen.jsx';
import PostScreen from './PostScreen.jsx';
import ViewScreen from './ViewScreen.jsx';
import LoginScreen from './LoginScreen.jsx'; // 1. インポート

import './App.css'; 

function App() {
  return (
    <BrowserRouter>
      <div className="App"> {/* <-- エラーが指していた開始タグ */}

        <nav>
          <ul>
            <li><Link to="/">タイトル</Link></li>
            <li><Link to="/home">ホーム</Link></li>
            <li><Link to="/post">聖地マップ作成</Link></li>
          </ul>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<TitleScreen />} />
            <Route path="/login" element={<LoginScreen />} /> {/* 2. 追加した行 */}
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/post" element={<PostScreen />} />
            <Route path="/view/:pilgrimageId" element={<ViewScreen />} />
          </Routes>
        </div>

      </div> 
    </BrowserRouter>
  );
}

export default App;