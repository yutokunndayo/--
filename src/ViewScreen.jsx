import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '400px', backgroundColor: '#ddd', marginBottom: '30px', border: '1px solid #ccc', borderRadius: '4px' };

function ViewScreen() {
  const { pilgrimageId } = useParams();
  const [pilgrimage, setPilgrimage] = useState(null);
  const [map, setMap] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // ★重要: APIからデータを取得する
  useEffect(() => {
    fetch(`http://localhost:3000/api/pilgrimages/${pilgrimageId}`)
      .then(res => res.json())
      .then(data => setPilgrimage(data))
      .catch(err => console.error(err));
  }, [pilgrimageId]);

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);

  // データ取得後に地図の範囲を調整
  useEffect(() => {
    if (map && pilgrimage && pilgrimage.spots && pilgrimage.spots.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      pilgrimage.spots.forEach(spot => bounds.extend({ lat: Number(spot.lat), lng: Number(spot.lng) }));
      map.fitBounds(bounds);
    }
  }, [map, pilgrimage]);

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    if (map) {
      map.panTo({ lat: Number(spot.lat), lng: Number(spot.lng) });
      map.setZoom(16);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!pilgrimage) return <div>読み込み中...</div>;

  return (
    <div>
      <div style={{ marginBottom: '15px' }}><Link to="/home">← ホームに戻る</Link></div>
      <div className="view-header">
        <h2>{pilgrimage.mapTitle} <span style={{fontSize:'0.6em'}}>({pilgrimage.workTitle})</span></h2>
        <div className="view-meta" style={{ display:'flex', gap:'15px', color:'#666', fontSize:'0.9em' }}>
          <span>作成者: {pilgrimage.author}</span> | <span>スポット数: {pilgrimage.spots.length}件</span>
        </div>
      </div>

      {isLoaded && (
        <GoogleMap mapContainerStyle={mapContainerStyle} onLoad={onLoad} zoom={10} center={{ lat: 35.689, lng: 139.692 }}>
          {pilgrimage.spots.map((spot, index) => (
            <Marker 
              key={spot.id} 
              position={{ lat: Number(spot.lat), lng: Number(spot.lng) }} 
              label={{ text: (index + 1).toString(), color: "white", fontWeight: "bold" }}
              onClick={() => setSelectedSpot(spot)}
            />
          ))}
          {selectedSpot && (
            <InfoWindow
              position={{ lat: Number(selectedSpot.lat), lng: Number(selectedSpot.lng) }}
              onCloseClick={() => setSelectedSpot(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
            >
              <div style={{ maxWidth: '200px' }}>
                <h4>{selectedSpot.name}</h4>
                {selectedSpot.address && <p>📍 {selectedSpot.address}</p>}
                {selectedSpot.image_path && <img src={`http://localhost:3000/${selectedSpot.image_path}`} style={{width:'100%'}} alt="spot" />}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}

      <div className="spots-list">
        {pilgrimage.spots.map((spot, index) => (
          <div key={spot.id} className="spot-card" onClick={() => handleSpotClick(spot)} style={{cursor:'pointer', padding:'10px', border:'1px solid #ccc', marginBottom:'10px', borderRadius:'5px'}}>
            <h4>{index+1}. {spot.name}</h4>
            {spot.address && <p>📍 {spot.address}</p>}
            {spot.nearby_info && <p>📝 {spot.nearby_info}</p>}
            {spot.image_path && <img src={`http://localhost:3000/${spot.image_path}`} style={{maxHeight:'150px', borderRadius:'4px'}} alt="spot" />}
          </div>
        ))}
      </div>
    </div>
  );
}
export default ViewScreen;