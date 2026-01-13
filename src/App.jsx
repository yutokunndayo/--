import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

import HomeScreen from './HomeScreen.jsx';
import PostScreen from './PostScreen.jsx';
import ViewScreen from './ViewScreen.jsx';
import LoginScreen from './LoginScreen.jsx';
import SelectionScreen from './SelectionScreen.jsx'; // ★追加
import NavBar from './NavBar.jsx'; 

import './App.css'; 

// ログインチェック用コンポーネント
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />; // 未ログインならトップ（ログイン画面）へ
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <NavBar /> 

        <div className="content">
          <Routes>
            {/* ★変更: トップページ(/)はログイン画面にする */}
            <Route path="/" element={<LoginScreen />} />
            <Route path="/login" element={<LoginScreen />} />

            {/* ★追加: 選択画面 (ログイン必須) */}
            <Route 
              path="/select" 
              element={
                <ProtectedRoute>
                  <SelectionScreen />
                </ProtectedRoute>
              } 
            />

            {/* 一覧・検索画面 (ログイン必須) */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <HomeScreen />
                </ProtectedRoute>
              } 
            />

            {/* 詳細画面 (ログイン必須) */}
            <Route 
              path="/view/:pilgrimageId" 
              element={
                <ProtectedRoute>
                  <ViewScreen />
                </ProtectedRoute>
              } 
            />
            
            {/* 投稿画面 (ログイン必須) */}
            <Route 
              path="/post" 
              element={
                <ProtectedRoute>
                  <PostScreen />
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