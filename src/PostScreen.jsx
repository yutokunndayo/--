import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%', height: '300px', marginTop: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc'
};

function PostScreen() {
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [workTitle, setWorkTitle] = useState('');
  const [mapTitle, setMapTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [spots, setSpots] = useState([]);
  
  // 送信中かどうかを判定するフラグ
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [spotName, setSpotName] = useState('');
  const [address, setAddress] = useState(''); 
  const [spotLat, setSpotLat] = useState('');
  const [spotLng, setSpotLng] = useState('');
  const [nearbyInfo, setNearbyInfo] = useState('');
  const [spotImage, setSpotImage] = useState(null);
  const [map, setMap] = useState(null);

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  // 住所検索機能
  const handleSearchAddress = () => {
    if (!isLoaded || !address) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        setSpotLat(lat);
        setSpotLng(lng);
        if (!spotName) setSpotName(address);
        if (map) { map.panTo({ lat, lng }); map.setZoom(16); }
      } else { alert('場所が見つかりませんでした: ' + status); }
    });
  };

  const handleMapClick = (e) => {
    setSpotLat(e.latLng.lat());
    setSpotLng(e.latLng.lng());
  };

  const handleAddSpot = () => {
    if (!spotName) { alert('「場所名」を入力してください'); return; }
    if (!spotLat || !spotLng) { alert('「住所検索」するか、地図をクリックしてピンを立ててください'); return; }

    const newSpot = {
      id: spots.length + 1, 
      name: spotName, 
      address: address,
      lat: parseFloat(spotLat), 
      lng: parseFloat(spotLng),
      nearbyInfo: nearbyInfo, 
      imageFile: spotImage,
    };

    setSpots([...spots, newSpot]);
    setSpotName(''); setAddress(''); setSpotLat(''); setSpotLng('');
    setNearbyInfo(''); setSpotImage(null);
  };

  // 保存ボタン
  const handleSubmitMap = async (e) => {
    e.preventDefault();
    if (spots.length === 0) { alert("スポットが1つもありません"); return; }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('workTitle', workTitle);
    formData.append('mapTitle', mapTitle);
    if (coverImage) formData.append('coverImage', coverImage);

    // ★作成者のIDを追加
    const userId = localStorage.getItem('userId');
    if (userId) formData.append('userId', userId);

    const spotsData = spots.map(s => ({
      name: s.name, address: s.address, lat: s.lat, lng: s.lng, nearbyInfo: s.nearbyInfo
    }));
    formData.append('spots', JSON.stringify(spotsData));

    spots.forEach((spot, index) => {
      if (spot.imageFile) formData.append(`spotImage_${index}`, spot.imageFile);
    });

    try {
      const response = await fetch('http://localhost:3000/api/pilgrimages', { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
      alert('保存しました！');
      navigate('/home');
    } catch (err) { 
      console.error(err);
      alert(`保存失敗: ${err.message}`); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>聖地巡礼マップを作成する</h2>
      <form onSubmit={handleSubmitMap}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label>作品名:</label>
          <input type="text" value={workTitle} onChange={(e) => setWorkTitle(e.target.value)} required placeholder="例: 作品A" />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label>マップのタイトル:</label>
          <input type="text" value={mapTitle} onChange={(e) => setMapTitle(e.target.value)} required placeholder="例: 東京聖地巡礼" />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label>カバー画像:</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} style={{ border: 'none' }} />
        </div>

        <hr />
        <h3>聖地スポットを追加</h3>
        
        <div style={{ marginBottom: '1rem', backgroundColor: '#e6dac8', padding: '10px', borderRadius: '4px' }}>
          <label style={{display:'block', marginBottom:'5px', fontSize:'0.9em'}}>1. 住所検索 & 位置調整</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom:'10px' }}>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="例: 東京タワー" style={{ flexGrow: 1 }} />
            <button 
              type="button" 
              onClick={handleSearchAddress} 
              disabled={!isLoaded}
              style={{ 
                backgroundColor: isLoaded ? '#8c7853' : '#ccc', 
                color: '#fff', 
                cursor: isLoaded ? 'pointer' : 'not-allowed'
              }}
            >
              {isLoaded ? "検索" : "読込中..."}
            </button>
          </div>
          
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={spotLat ? { lat: parseFloat(spotLat), lng: parseFloat(spotLng) } : { lat: 35.689, lng: 139.692 }}
              zoom={spotLat ? 12 : 10}
              onLoad={onLoad} 
              onUnmount={onUnmount}
              onClick={handleMapClick}
            >
              {spotLat && spotLng && (
                <Marker 
                  position={{ lat: parseFloat(spotLat), lng: parseFloat(spotLng) }} 
                  draggable={true} 
                  onDragEnd={(e)=>{setSpotLat(e.latLng.lat()); setSpotLng(e.latLng.lng());}} 
                />
              )}
            </GoogleMap>
          ) : (
            <div style={{...mapContainerStyle, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#eee'}}>
              地図を読み込み中...
            </div>
          )}
          <p style={{fontSize:'0.8em', color:'#666'}}>※ピンをドラッグするか、地図をクリックして微調整できます。</p>
        </div>

        {/* ★ここが復活・修正した箇所です */}
        <div style={{ marginBottom: '1rem' }}>
          <label>2. スポット詳細</label>
          <input type="text" value={spotName} onChange={(e) => setSpotName(e.target.value)} placeholder="場所名 (必須)" style={{marginBottom:'10px'}} />
          <textarea value={nearbyInfo} onChange={(e) => setNearbyInfo(e.target.value)} placeholder="メモ・おすすめ情報" style={{ height: '60px', marginBottom:'10px' }} />
          <input type="file" accept="image/*" key={spotImage ? spotImage.name : 'reset'} onChange={(e) => setSpotImage(e.target.files[0])} style={{ border: 'none', fontSize: '0.9em' }} />
        </div>
        
        <button type="button" onClick={handleAddSpot} style={{ width: '100%', marginBottom: '20px' }}>↓ このスポットを追加</button>

        <h4>追加済み: {spots.length}件</h4>
        <ul>
          {spots.map(s => (
            <li key={s.id} style={{marginBottom:'5px', display:'flex', alignItems:'center'}}>
              <strong>{s.name}</strong> 
              
              {/* ★変更: 画像があれば、カメラマークではなくサムネイルを表示 */}
              {s.imageFile ? (
                <img 
                  src={URL.createObjectURL(s.imageFile)} 
                  alt="プレビュー" 
                  style={{height: '40px', marginLeft: '10px', borderRadius: '4px', border:'1px solid #ccc'}} 
                />
              ) : (
                <span style={{fontSize:'0.8em', color:'#999', marginLeft:'5px'}}>(画像なし)</span>
              )}

              <span style={{fontSize:'0.8em', color:'#666', marginLeft:'10px'}}>
                ({s.address || '住所なし'})
              </span>
            </li>
          ))}
        </ul>
        
        <hr />
        <button 
          type="submit" 
          disabled={spots.length === 0 || isSubmitting} 
          style={{ 
            padding: '15px', 
            fontSize: '1.1em',
            width: '100%',
            backgroundColor: isSubmitting ? '#e07a5f' : '#4CAF50', 
            color: 'white',
            cursor: isSubmitting ? 'wait' : 'pointer'
          }}
        >
          {isSubmitting ? '送信中... (そのままお待ちください)' : '保存する'}
        </button>
      </form>
    </div>
  );
}
export default PostScreen;