import React from 'react';
import { Link } from 'react-router-dom';

function SelectionScreen() {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h2 style={{ color: '#4a3a2a', marginBottom: '40px' }}>何をしますか？</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '0 auto' }}>
        <Link to="/home" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '30px', border: '2px solid #8c7853', borderRadius: '10px', backgroundColor: '#fff', color: '#4a3a2a' }}>
            <h3 style={{ margin: 0 }}>🔍 マップを探す</h3>
            <p style={{ margin: '10px 0 0', fontSize: '0.9em' }}>みんなの投稿を見る</p>
          </div>
        </Link>
        <Link to="/post" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '30px', border: '2px solid #8c7853', borderRadius: '10px', backgroundColor: '#fff', color: '#4a3a2a' }}>
            <h3 style={{ margin: 0 }}>✏️ マップを作る</h3>
            <p style={{ margin: '10px 0 0', fontSize: '0.9em' }}>自分の足跡を記録する</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
export default SelectionScreen;