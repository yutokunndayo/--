import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

// TitleScreen は削除しました
import HomeScreen from './HomeScreen.jsx';
import PostScreen from './PostScreen.jsx';
import ViewScreen from './ViewScreen.jsx';
import LoginScreen from './LoginScreen.jsx';

import './App.css'; 

// ログインチェック用コンポーネント
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <ul>
            {/* タイトルリンク先をホームに変更 */}
            <li><Link to="/">ホーム (追憶の地図)</Link></li>
            <li><Link to="/post">＋ 聖地マップ作成</Link></li>
          </ul>
        </nav>

        <div className="content">
          <Routes>
            {/* ルートパス(/) をホーム画面にする（ただしログイン必須） */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <HomeScreen />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<LoginScreen />} />
            
            {/* /home も / と同じくホーム画面へ */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <HomeScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post" 
              element={
                <ProtectedRoute>
                  <PostScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/view/:pilgrimageId" 
              element={
                <ProtectedRoute>
                  <ViewScreen />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </div> 
    </BrowserRouter>
  );
}

export default App;