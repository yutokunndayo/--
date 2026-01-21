import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      
      /* ★上下を詰めてスリムに */
      padding: '5px 30px', 
      
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(10px)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', boxSizing: 'border-box'
    }}>
      {/* ロゴ */}
      <Link to="/select" style={{ textDecoration: 'none', color: '#4a3b2a', fontSize: '1.4rem', fontWeight: 'bold', fontFamily: "'Noto Serif JP', serif" }}>
        Pilgrimage Map
      </Link>

      {/* 右側のメニュー */}
      <div style={{ display: 'flex', gap: '25px' }}>
        {/* メニュー画面（選択画面）へ戻る */}
        <Link to="/select" style={{ textDecoration: 'none', color: '#4a3b2a', fontWeight: 'bold' }}>
          📂 メニュー
        </Link>
        
        {/* ログアウト（ログイン画面へ） */}
        <Link to="/" style={{ textDecoration: 'none', color: '#8c7853', fontWeight: 'bold', borderBottom: '1px solid #8c7853' }}>
          🚪 ログアウト
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;