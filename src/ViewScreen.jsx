import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
// ★ InfoWindow を追加インポート
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '400px', backgroundColor: '#ddd', marginBottom: '30px', border: '1px solid #ccc', borderRadius: '4px' };

function ViewScreen() {
  const { pilgrimageId } = useParams();
  const [pilgrimage, setPilgrimage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  
  // ★追加: 選択中のスポット（吹き出し表示用）
  const [selectedSpot, setSelectedSpot] = useState(null);

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

  // ★追加: リストをクリックした時に地図を移動させて吹き出しを開く関数
  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    if (map) {
      map.panTo({ lat: Number(spot.lat), lng: Number(spot.lng) });
      map.setZoom(16); // 少し拡大
    }
    // 画面上部へスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="loading">読み込み中...</div>;
  if (!pilgrimage) return <div className="error">データが見つかりませんでした。</div>;

  return (
    <div>
      <div style={{ marginBottom: '15px' }}>
        <Link to="/home" style={{ display:'inline-flex', alignItems:'center', gap:'5px' }}>
          ← ホームに戻る
        </Link>
      </div>

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

      {isLoaded ? (
        <GoogleMap mapContainerStyle={mapContainerStyle} onLoad={onLoad} onUnmount={onUnmount} zoom={10} center={{ lat: 35.689, lng: 139.692 }}>
          
          {pilgrimage.spots.map((spot, index) => (
            <Marker 
              key={spot.id} 
              position={{ lat: Number(spot.lat), lng: Number(spot.lng) }} 
              label={{ text: (index + 1).toString(), color: "white", fontWeight: "bold" }}
              // ★追加: ピンをクリックしたら吹き出しを開く
              onClick={() => setSelectedSpot(spot)}
            />
          ))}

          {/* ★追加: 吹き出し (InfoWindow) の表示 */}
          {selectedSpot && (
            <InfoWindow
              position={{ lat: Number(selectedSpot.lat), lng: Number(selectedSpot.lng) }}
              onCloseClick={() => setSelectedSpot(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
            >
              <div style={{ maxWidth: '250px' }}>
                <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #ccc', paddingBottom: '3px' }}>{selectedSpot.name}</h4>
                
                {/* 住所があれば表示 */}
                {selectedSpot.address && <p style={{ fontSize: '0.8em', margin: '5px 0' }}>📍 {selectedSpot.address}</p>}
                
                {selectedSpot.image_path && (
                  <img 
                    src={`http://localhost:3000/${selectedSpot.image_path}`} 
                    alt="spot" 
                    style={{ width: '100%', borderRadius: '4px', marginTop: '5px' }} 
                  />
                )}
                {selectedSpot.nearby_info && <p style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>{selectedSpot.nearby_info}</p>}
              </div>
            </InfoWindow>
          )}

        </GoogleMap>
      ) : ( <div>地図を読み込み中...</div> )}

      <h3 style={{ borderBottom: '2px solid #d8c8b0', paddingBottom: '10px', marginBottom: '20px' }}>
        巡礼スポット一覧
      </h3>

      <div className="spots-list">
        {pilgrimage.spots.map((spot, index) => (
          // リストをクリック可能にする
          <div 
            key={spot.id} 
            className="spot-card" 
            style={{ cursor: 'pointer', transition: '0.2s' }}
            onClick={() => handleSpotClick(spot)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            
            <div className="spot-number">{index + 1}</div>
            
            <div className="spot-details">
              <h4 className="spot-name">
                {spot.name} 
                <span style={{fontSize:'0.7em', color:'#8c7853', fontWeight:'normal', marginLeft:'10px'}}>
                  (地図で見る)
                </span>
              </h4>
              
              {spot.address && ( <p className="spot-address">📍 {spot.address}</p> )}
              {spot.nearby_info && ( <div className="spot-memo"><span style={{fontWeight:'bold'}}>Memo:</span> {spot.nearby_info}</div> )}

              {spot.image_path && (
                <div className="spot-image-container">
                  <img src={`http://localhost:3000/${spot.image_path}`} alt={spot.name} />
                </div>
              )}

              <div style={{ marginTop: '10px' }} onClick={(e) => e.stopPropagation()}>
                <a href={`http://googleusercontent.com/maps.google.com/?q=${spot.lat},${spot.lng}`} target="_blank" rel="noopener noreferrer" className="google-maps-link">
                  🗺️ Googleマップアプリで開く
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