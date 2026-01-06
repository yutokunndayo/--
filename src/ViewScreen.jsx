import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '400px', backgroundColor: '#ddd', marginBottom: '30px', border: '1px solid #ccc', borderRadius: '4px' };

function ViewScreen() {
  const { pilgrimageId } = useParams();
  const [pilgrimage, setPilgrimage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    fetch(`http://localhost:3000/api/pilgrimages/${pilgrimageId}`)
      .then(res => res.json())
      .then(data => { setPilgrimage(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [pilgrimageId]);

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  useEffect(() => {
    if (map && pilgrimage && pilgrimage.spots.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      pilgrimage.spots.forEach(spot => bounds.extend({ lat: Number(spot.lat), lng: Number(spot.lng) }));
      if (pilgrimage.spots.length === 1) {
        map.setCenter({ lat: Number(pilgrimage.spots[0].lat), lng: Number(pilgrimage.spots[0].lng) });
        map.setZoom(15);
      } else {
        map.fitBounds(bounds);
      }
    }
  }, [map, pilgrimage]);

  if (loading) return <div className="loading">読み込み中...</div>;
  if (!pilgrimage) return <div className="error">データが見つかりませんでした。</div>;

  return (
    <div>
      <div style={{ marginBottom: '15px' }}>
        <Link to="/home" style={{ display:'inline-flex', alignItems:'center', gap:'5px' }}>
          ← ホームに戻る
        </Link>
      </div>

      {/* ヘッダー情報 */}
      <div className="view-header">
        <span style={{ backgroundColor: '#8c7853', color: '#fff', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8em' }}>
          {pilgrimage.workTitle}
        </span>
        <div className="view-title-area">
          <h2 style={{ margin: '10px 0' }}>{pilgrimage.mapTitle}</h2>
        </div>
        <div className="view-meta" style={{ display:'flex', gap:'15px', color:'#666', fontSize:'0.9em' }}>
          <span>👤 作成者: {pilgrimage.author}</span>
          <span>📍 スポット数: {pilgrimage.spots.length}件</span>
        </div>
      </div>

      {/* 地図エリア */}
      {isLoaded ? (
        <GoogleMap mapContainerStyle={mapContainerStyle} onLoad={onLoad} onUnmount={onUnmount} zoom={10} center={{ lat: 35.689, lng: 139.692 }}>
          {pilgrimage.spots.map((spot, index) => (
            <Marker key={spot.id} position={{ lat: Number(spot.lat), lng: Number(spot.lng) }} label={{ text: (index + 1).toString(), color: "white", fontWeight: "bold" }} />
          ))}
        </GoogleMap>
      ) : ( <div>地図を読み込み中...</div> )}

      <h3 style={{ borderBottom: '2px solid #d8c8b0', paddingBottom: '10px', marginBottom: '20px' }}>
        巡礼スポット一覧
      </h3>

      {/* ★変更: 見やすいカード型リスト */}
      <div className="spots-list">
        {pilgrimage.spots.map((spot, index) => (
          <div key={spot.id} className="spot-card">
            
            {/* 番号 */}
            <div className="spot-number">{index + 1}</div>
            
            <div className="spot-details">
              {/* 名前と住所 */}
              <h4 className="spot-name">{spot.name}</h4>
              {spot.address && (
                <p className="spot-address">📍 {spot.address}</p>
              )}

              {/* メモ */}
              {spot.nearby_info && (
                <div className="spot-memo">
                  <span style={{fontWeight:'bold'}}>Memo:</span> {spot.nearby_info}
                </div>
              )}

              {/* 画像 */}
              {spot.image_path && (
                <div className="spot-image-container">
                  <img src={`http://localhost:3000/${spot.image_path}`} alt={spot.name} />
                </div>
              )}

              {/* Google Mapsリンク */}
              <div style={{ marginTop: '10px' }}>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="google-maps-link"
                >
                  🗺️ Googleマップで開く
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ViewScreen;