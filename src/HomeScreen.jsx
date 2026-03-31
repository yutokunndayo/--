import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HomeScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pilgrimages, setPilgrimages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

fetch(`${API_URL}/api/pilgrimages`)
      .then(res => res.json())
      .then(data => { setPilgrimages(data); setIsLoading(false); })
      .catch(err => { console.error(err); setIsLoading(false); });
  }, []);

  const filtered = pilgrimages.filter(m => 
    m.work.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* タイトル部分を統合 */}
      <div style={{ textAlign: 'center', marginBottom: '40px', padding: '20px 0', borderBottom: '2px dashed #c9b8a0' }}>
        <h1 style={{ fontSize: '2.5em', color: '#4a3a2a', margin: '0' }}>あの景色</h1>
        <h2 style={{ fontSize: '1.2em', color: '#8c7853', marginTop: '5px' }}>聖地巡礼MAP</h2>
        <p style={{ color: '#7a6a5a' }}>物語の舞台を、あなたの足跡で記録しよう。</p>
      </div>

      <div className="search-bar-container">
        <span style={{fontSize: '1.5em'}}>🔍</span>
        <input type="text" placeholder="検索..." className="search-input" 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <h3 style={{ borderLeft: '5px solid #8c7853', paddingLeft: '10px' }}>注目の聖地巡礼マップ</h3>
      
      {isLoading ? <div className="loading">読み込み中...</div> : (
        <div className="pilgrimage-grid">
          {filtered.length > 0 ? filtered.map(map => (
            <Link to={`/view/${map.id}`} key={map.id} className="map-card">
              <div className="card-image">
                {map.image_path ? (
                  <img src={`${API_URL}/${map.image_path}`} alt="cover" />
                ) : (
                  <img src={`https://picsum.photos/seed/${map.id}/400/250`} alt="dummy" />
                )}
              </div>
              <div className="card-content">
                <span className="card-work-badge">{map.work}</span>
                <h3 className="card-title">{map.title}</h3>
                <div className="card-info">📍 詳細を見る</div>
              </div>
            </Link>
          )) : <p className="no-results-text">マップが見つかりません。</p>}
        </div>
      )}
    </div>
  );
}
export default HomeScreen;