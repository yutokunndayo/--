import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MyPageScreen() {
  const [myMaps, setMyMaps] = useState([]);
  const [mySpots, setMySpots] = useState([]); // 自分のスポット
  const [loading, setLoading] = useState(true);
  
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!userId) return;

    // マップとスポットの両方を取得
    const fetchMaps = fetch(`http://localhost:3000/api/users/${userId}/pilgrimages`).then(res => res.json());
    const fetchSpots = fetch(`http://localhost:3000/api/users/${userId}/spots`).then(res => res.json());

    Promise.all([fetchMaps, fetchSpots])
      .then(([mapsData, spotsData]) => {
        setMyMaps(mapsData);
        setMySpots(spotsData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

  // マップ削除
  const handleDeleteMap = async (id) => {
    if (!window.confirm('本当にマップを削除しますか？')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/pilgrimages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMyMaps(myMaps.filter(map => map.id !== id));
        alert('マップを削除しました');
      }
    } catch (err) { console.error(err); }
  };

  // ★スポット削除
  const handleDeleteSpot = async (id) => {
    if (!window.confirm('本当にこのスポットを削除しますか？')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/spots/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMySpots(mySpots.filter(spot => spot.id !== id));
        alert('スポットを削除しました');
      }
    } catch (err) { console.error(err); }
  };

  if (!userId) return <div style={{padding:'20px'}}>ログインしてください</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ borderBottom: '2px solid #8c7853', paddingBottom: '10px', marginBottom: '30px' }}>
        {username} さんのマイページ
      </h2>

      {/* --- セクション1: 投稿したスポット --- */}
      <h3 style={{ color: '#e07a5f', borderLeft: '5px solid #e07a5f', paddingLeft: '10px' }}>
        📍 投稿したスポット ({mySpots.length})
      </h3>
      
      {loading ? <p>読み込み中...</p> : (
        mySpots.length === 0 ? <p style={{color:'#666'}}>まだスポットを投稿していません。</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {mySpots.map(spot => (
              <li key={spot.id} style={{
                backgroundColor: '#fff', marginBottom: '15px', padding: '15px',
                borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {/* サムネイル */}
                  <div style={{ width: '60px', height: '60px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', backgroundColor: '#eee' }}>
                    {spot.image_path ? (
                      <img src={`http://localhost:3000/${spot.image_path}`} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                    ) : (
                      <span style={{display:'block', width:'100%', height:'100%', textAlign:'center', lineHeight:'60px'}}>📷</span>
                    )}
                  </div>
                  
                  {/* 情報 */}
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{spot.name}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      in <Link to={`/view/${spot.mapId}`} style={{ color: '#8c7853', fontWeight: 'bold' }}>
                         {spot.workTitle} - {spot.mapTitle}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 削除ボタン */}
                <button 
                  onClick={() => handleDeleteSpot(spot.id)}
                  style={{
                    backgroundColor: '#d9534f', color: '#fff', border: 'none',
                    padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'
                  }}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )
      )}

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '2px dashed #ccc' }} />

      {/* --- セクション2: 作成したマップ（枠） --- */}
      <h3 style={{ color: '#8c7853', borderLeft: '5px solid #8c7853', paddingLeft: '10px' }}>
        📂 作成したマップタイトル ({myMaps.length})
      </h3>

      {loading ? <p>読み込み中...</p> : (
        myMaps.length === 0 ? <p style={{color:'#666'}}>作成したタイトルはありません。</p> : (
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
                
                <div style={{ padding: '10px', marginTop: 'auto', borderTop: '1px solid #eee' }}>
                  <button 
                    onClick={() => handleDeleteMap(map.id)} 
                    style={{ 
                      width: '100%', padding: '10px', backgroundColor: '#d9534f', 
                      color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'
                    }}
                  >
                    このタイトルを削除
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