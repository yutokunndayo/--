import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MyPageScreen() {
  const [myMaps, setMyMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3000/api/users/${userId}/pilgrimages`)
      .then(res => res.json())
      .then(data => { setMyMaps(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [userId]);

  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？この操作は取り消せません。')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/pilgrimages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMyMaps(myMaps.filter(map => map.id !== id));
        alert('削除しました');
      } else {
        alert('削除に失敗しました');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #8c7853', paddingBottom: '10px', marginBottom: '20px' }}>
        {username} さんのマイページ
      </h2>

      <h3 style={{ color: '#4a3a2a' }}>📂 投稿したマップ一覧</h3>

      {loading ? <p>読み込み中...</p> : (
        myMaps.length === 0 ? <p>まだ投稿がありません。<Link to="/post">ここから作成</Link>しましょう！</p> : (
          <div className="pilgrimage-grid">
            {myMaps.map(map => (
              <div key={map.id} className="map-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/view/${map.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                  <div className="card-image">
                    {map.image_path ? (
                      <img src={`http://localhost:3000/${map.image_path}`} alt="cover" />
                    ) : (
                      <img src={`https://picsum.photos/seed/${map.id}/400/250`} alt="dummy" />
                    )}
                  </div>
                  <div className="card-content">
                    <span className="card-work-badge">{map.work}</span>
                    <h3 className="card-title">{map.title}</h3>
                  </div>
                </Link>
                
                {/* ★変更：ボタンエリアの高さを揃える設定 */}
                <div style={{ 
                  padding: '10px', 
                  display: 'flex', 
                  gap: '10px', 
                  borderTop: '1px solid #eee',
                  marginTop: 'auto' /* カードの下部に寄せる */
                }}>
                  {/* 編集ボタン（Linkで囲まれているため、Link自体を広げる） */}
                  <Link to={`/edit/${map.id}`} style={{ flex: 1, display: 'flex' }}>
                    <button style={{ 
                      width: '100%', 
                      padding: '10px', /* パディングを統一 */
                      backgroundColor: '#8c7853', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer', 
                      fontSize:'0.9rem', 
                      minWidth:'auto',
                      fontWeight: 'bold',
                      margin: 0 /* 余計なマージンを削除 */
                    }}>
                      編集
                    </button>
                  </Link>
                  
                  {/* 削除ボタン */}
                  <button 
                    onClick={() => handleDelete(map.id)} 
                    style={{ 
                      flex: 1, 
                      padding: '10px', /* パディングを統一 */
                      backgroundColor: '#d9534f', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer', 
                      fontSize:'0.9rem', 
                      minWidth:'auto', 
                      fontWeight: 'bold',
                      marginTop: 0,
                      margin: 0 /* 余計なマージンを削除 */
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default MyPageScreen;