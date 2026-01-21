import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  border: '4px solid #fff',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
};

function ViewScreen() {
  const { pilgrimageId } = useParams();
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // マップ上のクリック用
  const [selectedSpot, setSelectedSpot] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    fetch(`http://localhost:3000/api/pilgrimages/${pilgrimageId}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setMapData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [pilgrimageId]);

  // Google Mapのロード時の調整
  const [map, setMap] = useState(null);
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // データ読み込み完了時に、全スポットが収まるようにズーム調整
  useEffect(() => {
    if (map && mapData && mapData.spots.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      mapData.spots.forEach(spot => {
        bounds.extend({ lat: spot.latitude, lng: spot.longitude });
      });
      map.fitBounds(bounds);
    }
  }, [map, mapData]);

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>読み込み中...</div>;
  if (!mapData) return <div style={{textAlign:'center', marginTop:'50px'}}>データが見つかりませんでした</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* ヘッダー部分 */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <span style={{ 
          display: 'inline-block', 
          backgroundColor: '#8c7853', 
          color: '#fff', 
          padding: '5px 15px', 
          borderRadius: '20px', 
          fontSize: '0.9rem',
          marginBottom: '10px'
        }}>
          {mapData.workTitle}
        </span>
        <h2 style={{ fontSize: '2rem', margin: '10px 0', color: '#4a3b2a' }}>{mapData.mapTitle}</h2>
      </div>

      {/* Google Map */}
      <div style={{ marginBottom: '40px' }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {mapData.spots.map(spot => (
              <Marker
                key={spot.id}
                position={{ lat: spot.latitude, lng: spot.longitude }}
                onClick={() => setSelectedSpot(spot)}
                label={{
                  text: spot.spot_order.toString(),
                  color: "white",
                  fontWeight: "bold"
                }}
              />
            ))}

            {selectedSpot && (
              <InfoWindow
                position={{ lat: selectedSpot.latitude, lng: selectedSpot.longitude }}
                onCloseClick={() => setSelectedSpot(null)}
              >
                <div style={{ color: '#333', padding: '5px' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{selectedSpot.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{selectedSpot.address}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : <p>Map Loading...</p>}
      </div>

      {/* スポット詳細リスト */}
      <div>
        <h3 style={{ borderBottom: '2px solid #8c7853', paddingBottom: '10px', color: '#4a3b2a' }}>
          📍 巡礼スポット一覧
        </h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {mapData.spots.map((spot, index) => (
            <li key={spot.id} style={{ 
              display: 'flex', 
              marginBottom: '20px', 
              backgroundColor: 'rgba(255,255,255,0.6)', 
              borderRadius: '8px',
              padding: '15px',
              border: '1px solid rgba(255,255,255,0.8)'
            }}>
              {/* 番号 */}
              <div style={{ 
                marginRight: '20px', 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#8c7853',
                minWidth: '30px'
              }}>
                {index + 1}.
              </div>

              {/* 内容 */}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', color: '#4a3b2a' }}>
                  {spot.name}
                </h4>
                
                {spot.image_path && (
                  <div style={{ marginBottom: '10px' }}>
                    <img 
                      src={`http://localhost:3000/${spot.image_path}`} 
                      alt={spot.name} 
                      style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} 
                    />
                  </div>
                )}
                
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '0.95rem', color: '#666' }}>
                  住所: {spot.address}
                </p>
                
                {spot.nearby_info && (
                  <p style={{ margin: '0 0 15px 0', fontSize: '1rem', whiteSpace: 'pre-wrap', color: '#333' }}>
                    {spot.nearby_info}
                  </p>
                )}

                {/* ★追加: Google Mapsで開くボタン */}
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    backgroundColor: '#4285F4', // Google Mapっぽい青、またはテーマカラーの #8c7853 でもOK
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  🌏 Google Mapsで開く
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link to="/home" style={{ color: '#8c7853', fontWeight: 'bold', textDecoration: 'none', borderBottom: '1px solid' }}>
          一覧に戻る
        </Link>
      </div>
    </div>
  );
}

export default ViewScreen;