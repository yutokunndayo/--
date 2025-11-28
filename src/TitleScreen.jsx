import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import HomeScreen from './HomeScreen.jsx';
import PostScreen from './PostScreen.jsx';
import ViewScreen from './ViewScreen.jsx';
import LoginScreen from './LoginScreen.jsx';
import NavBar from './NavBar.jsx'; // NavBarを作っていなければ削除して <nav> を戻してください
import './App.css'; 

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <NavBar /> {/* または <nav>...</nav> */}
        <div className="content">
          <Routes>
            <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/post" element={<ProtectedRoute><PostScreen /></ProtectedRoute>} />
            <Route path="/view/:pilgrimageId" element={<ProtectedRoute><ViewScreen /></ProtectedRoute>} />
          </Routes>
        </div>
      </div> 
    </BrowserRouter>
  );
}
export default App;