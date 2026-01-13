import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '300px', marginBottom: '20px' };

function PostScreen() {
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });
  const [workTitle, setWorkTitle] = useState('');
  const [mapTitle, setMapTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [spots, setSpots] = useState([]);
  const [spotName, setSpotName] = useState('');
  const [address, setAddress] = useState(''); 
  const [spotLat, setSpotLat] = useState('');
  const [spotLng, setSpotLng] = useState('');
  const [nearbyInfo, setNearbyInfo] = useState('');
  const [spotImage, setSpotImage] = useState(null);
  const [map, setMap] = useState(null);

  const onLoad = useCallback((m) => setMap(m), []);
  const handleSearchAddress = () => {
    if (!isLoaded || !address) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        setSpotLat(loc.lat()); setSpotLng(loc.lng());
        if (!spotName) setSpotName(address);
        if (map) { map.panTo(loc); map.setZoom(16); }
      } else alert('見つかりませんでした');
    });
  };
  const handleAddSpot = () => {
    if (!spotName || !spotLat) return;
    setSpots([...spots, { id: spots.length+1, name: spotName, address, lat: spotLat, lng: spotLng, nearbyInfo, imageFile: spotImage }]);
    setSpotName(''); setAddress(''); setSpotLat(''); setSpotLng(''); setNearbyInfo(''); setSpotImage(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('workTitle', workTitle); fd.append('mapTitle', mapTitle);
    if (coverImage) fd.append('coverImage', coverImage);
    fd.append('spots', JSON.stringify(spots.map(s => ({ name: s.name, address: s.address, lat: s.lat, lng: s.lng, nearbyInfo: s.nearbyInfo }))));
    spots.forEach((s, i) => { if (s.imageFile) fd.append(`spotImage_${i}`, s.imageFile); });
    await fetch('http://localhost:3000/api/pilgrimages', { method: 'POST', body: fd });
    alert('保存完了'); navigate('/home');
  };

  return (
    <div>
      <h2>マップ作成</h2>
      <form onSubmit={handleSubmit}>
        <input value={workTitle} onChange={(e)=>setWorkTitle(e.target.value)} placeholder="作品名" style={{display:'block', marginBottom:'10px'}} required />
        <input value={mapTitle} onChange={(e)=>setMapTitle(e.target.value)} placeholder="マップタイトル" style={{display:'block', marginBottom:'10px'}} required />
        <label>カバー画像: <input type="file" onChange={(e)=>setCoverImage(e.target.files[0])} /></label>
        <hr />
        <h3>スポット追加</h3>
        <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
          <input value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="住所検索 (例: 東京タワー)" />
          <button type="button" onClick={handleSearchAddress}>検索</button>
        </div>
        {isLoaded && <GoogleMap mapContainerStyle={mapContainerStyle} center={{lat:35.689, lng:139.692}} zoom={10} onLoad={onLoad} onClick={(e)=>{setSpotLat(e.latLng.lat()); setSpotLng(e.latLng.lng());}}>
          {spotLat && <Marker position={{lat: Number(spotLat), lng: Number(spotLng)}} draggable={true} onDragEnd={(e)=>{setSpotLat(e.latLng.lat()); setSpotLng(e.latLng.lng());}} />}
        </GoogleMap>}
        <input value={spotName} onChange={(e)=>setSpotName(e.target.value)} placeholder="場所名" style={{display:'block', marginBottom:'5px'}} />
        <textarea value={nearbyInfo} onChange={(e)=>setNearbyInfo(e.target.value)} placeholder="メモ" style={{display:'block', marginBottom:'5px', width:'100%'}} />
        <label>写真: <input type="file" key={spotImage ? 'img' : 'no'} onChange={(e)=>setSpotImage(e.target.files[0])} /></label>
        <button type="button" onClick={handleAddSpot} style={{display:'block', marginTop:'10px'}}>追加</button>
        <ul>{spots.map(s => <li key={s.id}>{s.name}</li>)}</ul>
        <hr /><button type="submit" disabled={!spots.length}>保存</button>
      </form>
    </div>
  );
}
export default PostScreen;