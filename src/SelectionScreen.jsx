import React from 'react';
import { Link } from 'react-router-dom';

function SelectionScreen() {
  return (
    <div style={{ textAlign: 'center', width: '100%', padding: '10px 0' }}>
      <h2 style={{ color: '#4a3a2a', marginBottom: '40px' }}>何をしますか？</h2>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'center',  
        alignItems: 'stretch',
        gap: '20px',               
        width: '100%',             
        flexWrap: 'wrap'
      }}>
        
        {/* 1. 探すボタン */}
        <Link to="/home" style={{ textDecoration: 'none', flex: '1 1 200px', maxWidth: '300px' }}>
          <div 
            style={{ 
              padding: '30px', 
              border: '2px solid #8c7853', 
              borderRadius: '6px', 
              backgroundColor: '#fff', 
              color: '#4a3a2a',
              height: '100%', 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>🔍</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3em' }}>マップを探す</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>みんなの投稿を見る</p>
          </div>
        </Link>

        {/* 2. 作るボタン（ここを変更） */}
        <Link to="/post" style={{ textDecoration: 'none', flex: '1 1 200px', maxWidth: '300px' }}>
          <div 
            style={{ 
              padding: '30px', 
              border: '2px solid #8c7853', 
              borderRadius: '6px', 
              backgroundColor: '#fff', 
              color: '#4a3a2a',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* アイコンも変更しても良いですがそのままでもOK */}
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>✨</div> 
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3em' }}>タイトルを作る</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>新しい聖地の枠を作る</p>
          </div>
        </Link>

        {/* 3. マイページボタン */}
        <Link to="/mypage" style={{ textDecoration: 'none', flex: '1 1 200px', maxWidth: '300px' }}>
          <div 
            style={{ 
              padding: '30px', 
              border: '2px solid #8c7853', 
              borderRadius: '6px', 
              backgroundColor: '#fff', 
              color: '#4a3a2a',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>👤</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3em' }}>マイページ</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>投稿の編集・削除</p>
          </div>
        </Link>

      </div>
      
      <div style={{ marginTop: '40px' }}>
         <Link to="/" style={{ color: '#8c7853', fontSize: '0.9em', borderBottom: '1px solid' }}>ログアウト</Link>
      </div>
    </div>
  );
}
export default SelectionScreen;