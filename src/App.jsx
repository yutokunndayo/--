import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// ↓↓↓ すべて .jsx に変更します ↓↓↓
import TitleScreen from './TitleScreen.jsx';
import HomeScreen from './HomeScreen.jsx';
import PostScreen from './PostScreen.jsx';
import ViewScreen from './ViewScreen.jsx';

import './App.css'; 

function App() {
  return (
    <BrowserRouter>
      <div className="App">
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
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/post" element={<PostScreen />} />
            {/* :id は「マップのID」を渡すように変更 */}
            <Route path="/view/:pilgrimageId" element={<ViewScreen />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;