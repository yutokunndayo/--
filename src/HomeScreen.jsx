import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HomeScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pilgrimages, setPilgrimages] = useState([]);
  const [works, setWorks] = useState([]); // ★追加: 作品タグ用
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // マップ一覧と、作品タグ一覧を並行して取得
    Promise.all([
      fetch('http://localhost:3000/api/pilgrimages').then(res => res.json()),
      fetch('http://localhost:3000/api/works').then(res => res.json())
    ])
    .then(([mapsData, worksData]) => {
      setPilgrimages(mapsData);
      setWorks(worksData); // ★追加
      setIsLoading(false);
    })
    .catch(err => { console.error(err); setIsLoading(false); });
  }, []);

  const filteredMaps = pilgrimages.filter((map) => {
    const term = searchTerm.toLowerCase();
    return map.work.toLowerCase().includes(term) || map.title.toLowerCase().includes(term);
  });

  // ★追加: タグをクリックした時の処理
  const handleTagClick = (workTitle) => {
    setSearchTerm(workTitle); // 検索バーに作品名を入れる
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '30px', padding: '20px 0', borderBottom: '2px dashed #c9b8a0' }}>
        <h1 style={{ fontSize: '2.5em', color: '#4a3a2a', margin: '0' }}>聖地</h1>
        <h2 style={{ fontSize: '1.2em', color: '#8c7853', marginTop: '5px' }}>- Memoir Map -</h2>
        <p style={{ color: '#7a6a5a' }}>物語の舞台を、あなたの足跡で記録しよう。</p>
      </div>

      <div className="search-bar-container">
        <span style={{fontSize: '1.5em'}}>🔍</span>
        <input
          type="text"
          placeholder="作品名、マップ名で検索..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* ★追加: クリアボタン */}
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            style={{ marginLeft:'10px', padding:'5px 10px', fontSize:'0.8em', backgroundColor:'#ccc', border:'none' }}
          >
            × 解除
          </button>
        )}
      </div>

      {/* ★追加: 作品タグエリア ★ */}
      <div className="works-tags-container">
        <span style={{ fontSize:'0.9em', color:'#7a6a5a', marginRight:'10px' }}>人気の作品:</span>
        {works.map((work) => (
          <button 
            key={work.id} 
            className="work-tag" 
            onClick={() => handleTagClick(work.title)}
          >
            #{work.title} <span style={{fontSize:'0.8em', opacity:0.8}}>({work.count})</span>
          </button>
        ))}
      </div>

      <h3 style={{ borderLeft: '5px solid #8c7853', paddingLeft: '10px' }}>
        {searchTerm ? `「${searchTerm}」の検索結果` : '注目の聖地巡礼マップ'}
      </h3>
      
      {isLoading ? <div className="loading">読み込み中...</div> : (
        <div className="pilgrimage-grid">
          {filteredMaps.length > 0 ? (
            filteredMaps.map((map) => (
              <Link to={`/view/${map.id}`} key={map.id} className="map-card">
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
                  <div className="card-info">📍 詳細を見る</div>
                </div>
              </Link>
            ))
          ) : (
            <p className="no-results-text">マップが見つかりません。</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HomeScreen;