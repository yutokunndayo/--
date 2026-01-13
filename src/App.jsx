import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './HomeScreen.jsx';
import PostScreen from './PostScreen.jsx';
import ViewScreen from './ViewScreen.jsx';
import LoginScreen from './LoginScreen.jsx';
import SelectionScreen from './SelectionScreen.jsx';
import NavBar from './NavBar.jsx';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <NavBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/select" element={<ProtectedRoute><SelectionScreen /></ProtectedRoute>} />
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