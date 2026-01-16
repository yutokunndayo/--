import React from 'react';
import { Link } from 'react-router-dom';

function SelectionScreen() {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <h2 style={{ color: '#4a3a2a', marginBottom: '50px' }}>何をしますか？</h2>
      
      {/* ★ここを修正: 横並び(row)に変更し、幅を広げる */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', /* 横並び */
        justifyContent: 'center', 
        gap: '40px', /* ボタン間の隙間を広めに */
        maxWidth: '800px', /* 横幅制限を緩和 */
        margin: '0 auto',
        flexWrap: 'wrap' /* スマホなど画面が狭い時は自動で縦になるように */
      }}>
        
        {/* 左のボタン */}
        <Link to="/home" style={{ textDecoration: 'none', flex: 1, minWidth: '280px' }}>
          <div style={{ 
            padding: '50px 20px', 
            border: '2px solid #8c7853', 
            borderRadius: '8px', 
            backgroundColor: '#fff', 
            color: '#4a3a2a',
            height: '100%', /* 高さを揃える */
            boxSizing: 'border-box',
            transition: 'transform 0.2s', /* ホバー時の動き用 */
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5em' }}>🔍 マップを探す</h3>
            <p style={{ margin: 0, color: '#666' }}>みんなの投稿を見る</p>
          </div>
        </Link>

        {/* 右のボタン */}
        <Link to="/post" style={{ textDecoration: 'none', flex: 1, minWidth: '280px' }}>
          <div style={{ 
            padding: '50px 20px', 
            border: '2px solid #8c7853', 
            borderRadius: '8px', 
            backgroundColor: '#fff', 
            color: '#4a3a2a',
            height: '100%',
            boxSizing: 'border-box',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5em' }}>✏️ マップを作る</h3>
            <p style={{ margin: 0, color: '#666' }}>自分の足跡を記録する</p>
          </div>
        </Link>

      </div>
    </div>
  );
}
export default SelectionScreen;