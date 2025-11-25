import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Google Mapsの部品をインポート
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// 地図のスタイル設定
const mapContainerStyle = {
  width: '100%',
  height: '400px', // カードの下に表示する地図の高さ
  borderRadius: '8px',
  marginTop: '20px',
  border: '1px solid #d8c8b0'
};

// 地図の初期中心座標（例: 日本全体が見える位置）
const defaultCenter = {
  lat: 36.2048,
  lng: 138.2529
};

function HomeScreen() {
  // APIキーを読み込むフック
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // .envからキーを取得
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [pilgrimages, setPilgrimages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // バックエンドからデータ取得
  useEffect(() => {
    fetch('http://localhost:3000/api/pilgrimages')
      .then(res => res.json())
      .then(data => {
        setPilgrimages(data);
        setIsLoading(false);
      })
      .catch(err => { console.error(err); setIsLoading(false); });
  }, []);

  const filteredMaps = pilgrimages.filter((map) => {
    const term = searchTerm.toLowerCase();
    return map.work.toLowerCase().includes(term) || map.title.toLowerCase().includes(term);
  });

  return (
    <div>
      {/* ヘッダー部分 */}
      <div style={{ textAlign: 'center', marginBottom: '40px', padding: '20px 0', borderBottom: '2px dashed #c9b8a0' }}>
        <h1 style={{ fontSize: '2.5em', color: '#4a3a2a', margin: '0' }}>追憶の地図</h1>
        <h2 style={{ fontSize: '1.2em', color: '#8c7853', marginTop: '5px' }}>- Memoir Map -</h2>
        <p style={{ color: '#7a6a5a' }}>物語の舞台を、あなたの足跡で記録しよう。</p>
      </div>

      {/* 検索エリア */}
      <div className="search-bar-container">
        <span style={{fontSize: '1.5em'}}>🔍</span>
        <input
          type="text"
          placeholder="作品名、マップ名で検索..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h3 style={{ borderLeft: '5px solid #8c7853', paddingLeft: '10px' }}>注目の聖地巡礼マップ</h3>
      
      {isLoading ? <div className="loading">読み込み中...</div> : (
        <>
          {/* 1. カード一覧 */}
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

          {/* 2. 全体マップ表示 (おまけ機能) */}
          <h3 style={{ borderLeft: '5px solid #8c7853', paddingLeft: '10px', marginTop: '40px' }}>
            みんなの聖地マップ
          </h3>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={5}
            >
              {/* 本来はここに全マップのピンを表示できますが、
                  今回はシンプルに地図を表示するだけにしています */}
            </GoogleMap>
          ) : (
            <div>地図を読み込み中...</div>
          )}
        </>
      )}
    </div>
  );
}

export default HomeScreen;