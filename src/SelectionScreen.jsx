import React from 'react';
import { Link } from 'react-router-dom';

function SelectionScreen() {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0', width: '100%' }}>
      <h2 style={{ color: '#4a3a2a', marginBottom: '40px' }}>何をしますか？</h2>
      
      {/* ボタンを囲むエリア: 横並び(row)に設定 */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row',      /* ★ここが重要：横並び */
        justifyContent: 'center',  
        gap: '20px',               
        width: '100%',             
        flexWrap: 'wrap',          /* 画面が狭いときは折り返す */
        boxSizing: 'border-box'
      }}>
        
        {/* 左のボタン */}
        <Link to="/home" style={{ textDecoration: 'none', flex: '1 1 220px', maxWidth: '400px' }}>
          <div 
            style={{ 
              padding: '40px 20px', 
              border: '2px solid #8c7853', 
              borderRadius: '8px', 
              backgroundColor: '#fff', 
              color: '#4a3a2a',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>🔍</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4em' }}>マップを探す</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>みんなの投稿を見る</p>
          </div>
        </Link>

        {/* 右のボタン */}
        <Link to="/post" style={{ textDecoration: 'none', flex: '1 1 220px', maxWidth: '400px' }}>
          <div 
            style={{ 
              padding: '40px 20px', 
              border: '2px solid #8c7853', 
              borderRadius: '8px', 
              backgroundColor: '#fff', 
              color: '#4a3a2a',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>✏️</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4em' }}>マップを作る</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>自分の足跡を記録する</p>
          </div>
        </Link>

      </div>
    </div>
  );
}
export default SelectionScreen;