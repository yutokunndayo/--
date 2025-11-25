import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

import HomeScreen from './HomeScreen.jsx';
import PostScreen from './PostScreen.jsx';
import ViewScreen from './ViewScreen.jsx';
import LoginScreen from './LoginScreen.jsx';
import NavBar from './NavBar.jsx'; // ← 1. 新しく作ったNavBarをインポート

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
        
        {/* 2. ここにあった <nav>...</nav> を削除し、これ1行に置き換える */}
        <NavBar />

        <div className="content">
          <Routes>
            {/* ルートパス(/) をホーム画面にする（ログイン必須） */}
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