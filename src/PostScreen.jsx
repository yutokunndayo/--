import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// Google Mapのコンポーネントを追加インポート
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px', // 確認用なので少し小さめでOK
  marginTop: '10px',
  marginBottom: '20px',
  borderRadius: '4px',
  border: '1px solid #ccc'
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
  
  const [spotName, setSpotName] = useState('');
  const [address, setAddress] = useState(''); 
  const [spotLat, setSpotLat] = useState('');
  const [spotLng, setSpotLng] = useState('');
  const [nearbyInfo, setNearbyInfo] = useState('');
  const [spotImage, setSpotImage] = useState(null);

  // 地図のインスタンス
  const [map, setMap] = useState(null);

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  // 住所検索
  const handleSearchAddress = () => {
    if (!isLoaded) { alert('地図機能を読み込み中...'); return; }
    if (!address) { alert('住所を入力してください'); return; }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        // 座標をセット
        setSpotLat(lat);
        setSpotLng(lng);
        
        // 名前が空なら住所を入れる
        if (!spotName) setSpotName(address);

        // 地図をその場所に移動
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(16);
        }
      } else {
        alert('場所が見つかりませんでした: ' + status);
      }
    });
  };

  // ★追加: 地図をクリックした時の処理
  const handleMapClick = (e) => {
    setSpotLat(e.latLng.lat());
    setSpotLng(e.latLng.lng());
  };

  // ★追加: ピンをドラッグ終了した時の処理
  const handleMarkerDragEnd = (e) => {
    setSpotLat(e.latLng.lat());
    setSpotLng(e.latLng.lng());
  };

  const handleAddSpot = () => {
    if (!spotName || !spotLat || !spotLng) { alert('場所名と座標が必要です'); return; }
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
    
    // クリア
    setSpotName(''); setAddress(''); setSpotLat(''); setSpotLng('');
    setNearbyInfo(''); setSpotImage(null);
  };

  const handleSubmitMap = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('workTitle', workTitle);
    formData.append('mapTitle', mapTitle);
    if (coverImage) formData.append('coverImage', coverImage);

    const spotsData = spots.map(s => ({
      name: s.name,
      address: s.address,
      lat: s.lat,
      lng: s.lng,
      nearbyInfo: s.nearbyInfo
    }));
    formData.append('spots', JSON.stringify(spotsData));

    spots.forEach((spot, index) => {
      if (spot.imageFile) formData.append(`spotImage_${index}`, spot.imageFile);
    });

    try {
      const response = await fetch('http://localhost:3000/api/pilgrimages', {
        method: 'POST', body: formData, 
      });
      if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
      alert('聖地マップが正常に保存されました！');
      navigate('/home');
    } catch (err) {
      console.error(err); alert(`保存失敗: ${err.message}`);
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
            <button type="button" onClick={handleSearchAddress} style={{ backgroundColor: '#8c7853', color: '#fff' }}>検索</button>
          </div>

          {/* ★追加: 確認・調整用の地図 */}
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={spotLat && spotLng ? { lat: parseFloat(spotLat), lng: parseFloat(spotLng) } : { lat: 35.689, lng: 139.692 }}
              zoom={spotLat ? 16 : 10}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onClick={handleMapClick} // 地図クリックでピン移動
            >
              {spotLat && spotLng && (
                <Marker
                  position={{ lat: parseFloat(spotLat), lng: parseFloat(spotLng) }}
                  draggable={true} // ★重要: ドラッグ可能にする
                  onDragEnd={handleMarkerDragEnd} // ドラッグ終了時に座標更新
                />
              )}
            </GoogleMap>
          ) : (
            <div>地図読み込み中...</div>
          )}
          <p style={{ fontSize: '0.8em', color: '#666' }}>※ピンをドラッグするか、地図をクリックして正確な位置に合わせてください。</p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{display:'block', marginBottom:'5px', fontSize:'0.9em'}}>2. スポット情報の編集</label>
          <input type="text" value={spotName} onChange={(e) => setSpotName(e.target.value)} placeholder="場所名" />
        </div>
        
        {/* 緯度経度は自動入力されるので、readOnlyにしてユーザーが触らなくてもいいようにしてもOK */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
          <input type="number" value={spotLat} onChange={(e) => setSpotLat(e.target.value)} placeholder="緯度" />
          <input type="number" value={spotLng} onChange={(e) => setSpotLng(e.target.value)} placeholder="経度" />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <textarea value={nearbyInfo} onChange={(e) => setNearbyInfo(e.target.value)} placeholder="メモ・おすすめ情報" style={{ height: '60px' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{display:'block', marginBottom:'5px', fontSize:'0.9em'}}>写真 (任意):</label>
          <input type="file" accept="image/*" key={spotImage ? spotImage.name : 'reset'} onChange={(e) => setSpotImage(e.target.files[0])} style={{ border: 'none', fontSize: '0.9em' }} />
        </div>
        
        <button type="button" onClick={handleAddSpot} style={{ width: '100%', marginBottom: '20px' }}>↓ このスポットをリストに追加</button>

        <h4>追加済みスポット ({spots.length}件)</h4>
        <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
          {spots.map((spot) => (
            <li key={spot.id}>
              <strong>{spot.name}</strong> 
              {spot.imageFile && <span style={{fontSize:'0.8em', color:'#8c7853', marginLeft:'5px'}}>📷写真あり</span>}
            </li>
          ))}
        </ul>

        <hr />
        <button type="submit" disabled={spots.length === 0} style={{ padding: '15px', fontSize: '1.1em' }}>保存する</button>
      </form>
    </div>
  );
}
export default PostScreen;