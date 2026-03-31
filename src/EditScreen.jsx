import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%', height: '300px', marginTop: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc'
};

function EditScreen() {
  const { pilgrimageId } = useParams(); // URLからIDを取得

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [workTitle, setWorkTitle] = useState('');
  const [mapTitle, setMapTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null); // 新しいファイル
  const [existingCoverUrl, setExistingCoverUrl] = useState(null); // 既存の画像URL
  const [spots, setSpots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 入力用の一時ステート
  const [spotName, setSpotName] = useState('');
  const [address, setAddress] = useState(''); 
  const [spotLat, setSpotLat] = useState('');
  const [spotLng, setSpotLng] = useState('');
  const [nearbyInfo, setNearbyInfo] = useState('');
  const [spotImage, setSpotImage] = useState(null);
  const [map, setMap] = useState(null);

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  // 既存データの読み込み
  useEffect(() => {
   fetch(`${API_URL}/api/pilgrimages/${pilgrimageId}`)
      .then(res => {
  
        if (!res.ok) throw new Error('データ取得失敗');
        return res.json();
      })
      .then(data => {
        setWorkTitle(data.workTitle);
        setMapTitle(data.mapTitle);
        if (data.image_path) setExistingCoverUrl(data.image_path);
        
        // スポット情報を整形
        const loadedSpots = data.spots.map((s, index) => ({
          id: Date.now() + index, // 一時的なID
          name: s.name,
          address: s.address,
          lat: s.latitude,
          lng: s.longitude,
          nearbyInfo: s.nearby_info,
          existingImagePath: s.image_path, // 既存画像のパスを保持
          imageFile: null // 新規ファイルはなし
        }));
        setSpots(loadedSpots);
        setIsLoadingData(false);
      })
      .catch(err => {
        console.error(err);
        alert('マップ情報の読み込みに失敗しました');
        navigate('/mypage');
      });
  }, [pilgrimageId, navigate]);

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
      } else { alert('場所が見つかりませんでした'); }
    });
  };

  const handleMapClick = (e) => {
    setSpotLat(e.latLng.lat());
    setSpotLng(e.latLng.lng());
  };

  const handleAddSpot = () => {
    if (!spotName) { alert('「場所名」を入力してください'); return; }
    if (!spotLat || !spotLng) { alert('位置情報がありません'); return; }

    const newSpot = {
      id: Date.now(),
      name: spotName,
      address: address,
      lat: parseFloat(spotLat),
      lng: parseFloat(spotLng),
      nearbyInfo: nearbyInfo,
      imageFile: spotImage,
      existingImagePath: null
    };

    setSpots([...spots, newSpot]);
    setSpotName(''); setAddress(''); setSpotLat(''); setSpotLng('');
    setNearbyInfo(''); setSpotImage(null);
  };

  const handleDeleteSpot = (id) => {
    setSpots(spots.filter(s => s.id !== id));
  };

  const handleSubmitMap = async (e) => {
    e.preventDefault();
    if (spots.length === 0) { alert("スポットがありません"); return; }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('workTitle', workTitle);
    formData.append('mapTitle', mapTitle);
    if (coverImage) formData.append('coverImage', coverImage);

    // スポット情報をJSON文字列化（既存画像のパスも含める）
    const spotsData = spots.map(s => ({
      name: s.name, 
      address: s.address, 
      lat: s.lat, 
      lng: s.lng, 
      nearbyInfo: s.nearbyInfo,
      existingImagePath: s.existingImagePath // これをサーバーに送ることで画像を維持
    }));
    formData.append('spots', JSON.stringify(spotsData));

    // 新規画像ファイルの添付
    spots.forEach((spot, index) => {
      if (spot.imageFile) {
        formData.append(`spotImage_${index}`, spot.imageFile);
      }
    });

    try {
      // PUTメソッドで送信
    const response = await fetch(`${API_URL}/api/pilgrimages/${pilgrimageId}`, { 
        method: 'PUT', 
        body: formData 
      });
      if (!response.ok) throw new Error('更新失敗');
      alert('更新しました！');
      navigate('/mypage');
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <div>データを読み込み中...</div>;

  return (
    <div>
      <h2>マップを編集する</h2>
      <form onSubmit={handleSubmitMap}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label>作品名:</label>
          <input type="text" value={workTitle} onChange={(e) => setWorkTitle(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label>マップタイトル:</label>
          <input type="text" value={mapTitle} onChange={(e) => setMapTitle(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label>カバー画像:</label>
          {existingCoverUrl && !coverImage && (
            <div style={{ marginBottom: '10px' }}>
              <img src={`${API_URL}/${existingCoverUrl}`} alt="current" style={{ height: '100px', borderRadius: '4px' }} />
              <p style={{ fontSize: '0.8em', color: '#666' }}>※変更しない場合はそのまま</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} style={{ border: 'none' }} />
        </div>

        <hr />
        <h3>スポットの編集・追加</h3>
        
        {/* 追加済みスポットリスト */}
        <ul style={{ marginBottom: '20px', padding: 0 }}>
          {spots.map((s, idx) => (
            <li key={s.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{idx + 1}. {s.name}</strong>
                <div style={{ fontSize: '0.9em', color: '#666' }}>{s.address}</div>
                {s.imageFile ? <span style={{fontSize:'0.8em', color:'green'}}>[新規画像あり]</span> : s.existingImagePath ? <span style={{fontSize:'0.8em', color:'#8c7853'}}>[画像維持]</span> : null}
              </div>
              <button type="button" onClick={() => handleDeleteSpot(s.id)} style={{ backgroundColor: '#d9534f', padding: '5px 10px', minWidth: 'auto', fontSize: '0.8em', margin: 0 }}>削除</button>
            </li>
          ))}
        </ul>

        {/* 新規スポット追加フォーム (PostScreenと同じ) */}
        <div style={{ marginBottom: '1rem', backgroundColor: '#e6dac8', padding: '10px', borderRadius: '4px' }}>
          <label style={{display:'block', marginBottom:'5px', fontSize:'0.9em'}}>住所検索 & 位置調整</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom:'10px' }}>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="例: 東京タワー" style={{ flexGrow: 1 }} />
            <button type="button" onClick={handleSearchAddress} disabled={!isLoaded} style={{ backgroundColor: isLoaded ? '#8c7853' : '#ccc', color: '#fff' }}>検索</button>
          </div>
          
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={spotLat ? { lat: parseFloat(spotLat), lng: parseFloat(spotLng) } : { lat: 35.689, lng: 139.692 }}
              zoom={spotLat ? 12 : 10}
              onLoad={onLoad} onUnmount={onUnmount} onClick={handleMapClick}
            >
              {spotLat && spotLng && <Marker position={{ lat: parseFloat(spotLat), lng: parseFloat(spotLng) }} draggable={true} onDragEnd={(e)=>{setSpotLat(e.latLng.lat()); setSpotLng(e.latLng.lng());}} />}
            </GoogleMap>
          )}
          
          <input type="text" value={spotName} onChange={(e) => setSpotName(e.target.value)} placeholder="場所名" style={{marginBottom:'10px', width:'100%'}} />
          <textarea value={nearbyInfo} onChange={(e) => setNearbyInfo(e.target.value)} placeholder="メモ" style={{ height: '60px', marginBottom:'10px', width:'100%' }} />
          <input type="file" accept="image/*" key={spotImage ? spotImage.name : 'reset'} onChange={(e) => setSpotImage(e.target.files[0])} style={{ border: 'none' }} />
          
          <button type="button" onClick={handleAddSpot} style={{ width: '100%', marginTop: '10px' }}>↓ スポットを追加</button>
        </div>
        
        <hr />
        <button type="submit" disabled={isSubmitting} style={{ padding: '15px', fontSize: '1.1em', width: '100%', backgroundColor: isSubmitting ? '#e07a5f' : '#4CAF50', color: 'white' }}>
          {isSubmitting ? '更新中...' : '変更を保存する'}
        </button>
      </form>
    </div>
  );
}
export default EditScreen;