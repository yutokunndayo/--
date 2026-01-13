import React from 'react';
import { Link } from 'react-router-dom';

function SelectionScreen() {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h2 style={{ color: '#4a3a2a', marginBottom: '40px' }}>何をしますか？</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '0 auto' }}>
        
        {/* マップを探すボタン */}
        <Link to="/home" style={{ textDecoration: 'none' }}>
          <div style={{ 
            padding: '30px', 
            border: '2px solid #8c7853', 
            borderRadius: '10px', 
            backgroundColor: '#fff',
            color: '#4a3a2a',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: '0.3s'
          }}
          onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#8c7853'; e.currentTarget.style.color = '#fff';}}
          onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#4a3a2a';}}
          >
            <h3 style={{ margin: 0, fontSize: '1.5em' }}>🔍 マップを探す</h3>
            <p style={{ margin: '10px 0 0', fontSize: '0.9em' }}>みんなが作った聖地巡礼マップを見る</p>
          </div>
        </Link>

        {/* マップを作るボタン */}
        <Link to="/post" style={{ textDecoration: 'none' }}>
          <div style={{ 
            padding: '30px', 
            border: '2px solid #8c7853', 
            borderRadius: '10px', 
            backgroundColor: '#fff',
            color: '#4a3a2a',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: '0.3s'
          }}
          onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#8c7853'; e.currentTarget.style.color = '#fff';}}
          onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#4a3a2a';}}
          >
            <h3 style={{ margin: 0, fontSize: '1.5em' }}>✏️ マップを作る</h3>
            <p style={{ margin: '10px 0 0', fontSize: '0.9em' }}>自分の足跡を記録して投稿する</p>
          </div>
        </Link>

      </div>
    </div>
  );
}

export default SelectionScreen;