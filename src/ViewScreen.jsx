import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
  border: '4px solid #fff',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
};

function ViewScreen() {
  const { pilgrimageId } = useParams();
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // マップ上のクリック用（既存スポットの表示）
  const [selectedSpot, setSelectedSpot] = useState(null);

  // 新規スポット投稿用の状態
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newSpot, setNewSpot] = useState({
    name: '',
    address: '',
    nearbyInfo: '',
    lat: null,
    lng: null,
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 住所検索中のローディング状態
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // ログイン状態とユーザー情報の確認
  const isLoggedIn = !!localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // データ取得
  const fetchMapData = () => {
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
  };

  useEffect(() => {
    fetchMapData();
  }, [pilgrimageId]);

  // Google Mapのロード時の調整
  const [map, setMap] = useState(null);
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && mapData && mapData.spots.length > 0 && !isAddingMode) {
      const bounds = new window.google.maps.LatLngBounds();
      mapData.spots.forEach(spot => {
        bounds.extend({ lat: spot.latitude, lng: spot.longitude });
      });
      map.fitBounds(bounds);
    }
  }, [map, mapData]);

  // マップクリック時の処理（投稿モード時のみ位置を設定）
  const handleMapClick = (e) => {
    if (isAddingMode) {
      setNewSpot({
        ...newSpot,
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
    }
  };

  // 住所から位置情報を検索する機能
  const handleSearchAddress = () => {
    if (!isLoaded || !newSpot.address) return;
    setIsSearchingAddress(true);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: newSpot.address }, (results, status) => {
      setIsSearchingAddress(false);
      
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        // 名前が未入力なら、住所の一部を仮で入れる
        let updatedName = newSpot.name;
        if (!updatedName) {
           updatedName = newSpot.address; 
        }

        setNewSpot({ 
          ...newSpot, 
          lat: lat, 
          lng: lng,
          name: updatedName
        });

        // マップをその場所に移動
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(16);
        }
      } else {
        alert('住所が見つかりませんでした: ' + status);
      }
    });
  };

  // スポット投稿処理
  const handleAddSpotSubmit = async (e) => {
    e.preventDefault();
    if (!newSpot.lat || !newSpot.lng) {
      alert('「住所検索」ボタンを押すか、地図をクリックしてピンを立ててください');
      return;
    }
    if (!newSpot.name) {
      alert('スポット名を入力してください');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', newSpot.name);
    formData.append('address', newSpot.address);
    formData.append('nearbyInfo', newSpot.nearbyInfo);
    formData.append('lat', newSpot.lat);
    formData.append('lng', newSpot.lng);
    
    // ★追加: 投稿者のIDを送る
    if (currentUserId) {
      formData.append('userId', currentUserId);
    }

    if (newSpot.image) {
      formData.append('spotImage', newSpot.image);
    }

    try {
      const res = await fetch(`http://localhost:3000/api/pilgrimages/${pilgrimageId}/spots`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('投稿に失敗しました');

      alert('スポットを追加しました！');
      setIsAddingMode(false);
      setNewSpot({ name: '', address: '', nearbyInfo: '', lat: null, lng: null, image: null });
      fetchMapData(); 
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>読み込み中...</div>;
  if (!mapData) return <div style={{textAlign:'center', marginTop:'50px'}}>データが見つかりませんでした</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* ヘッダー部分 */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px dashed #8c7853', paddingBottom: '20px' }}>
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
        <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#4a3b2a' }}>{mapData.mapTitle}</h2>
        <p style={{ color: '#666' }}>みんなで作る聖地巡礼マップ</p>
        
        {isLoggedIn ? (
          !isAddingMode ? (
            <button 
              onClick={() => setIsAddingMode(true)}
              style={{
                backgroundColor: '#e07a5f', color: 'white', border: 'none', padding: '10px 20px',
                borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', marginTop: '10px'
              }}
            >
              📍 ここに新しいスポットを追加する
            </button>
          ) : (
            <button 
              onClick={() => setIsAddingMode(false)}
              style={{
                backgroundColor: '#999', color: 'white', border: 'none', padding: '10px 20px',
                borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', marginTop: '10px'
              }}
            >
              キャンセル
            </button>
          )
        ) : (
          <p style={{fontSize: '0.9rem', color: '#e07a5f'}}>ログインするとスポットを追加できます</p>
        )}
      </div>

      {/* スポット追加フォーム */}
      {isAddingMode && (
        <div style={{
          backgroundColor: '#fdf6e3', padding: '20px', borderRadius: '8px', 
          border: '2px solid #e07a5f', marginBottom: '20px'
        }}>
          <h3 style={{marginTop: 0, color: '#e07a5f'}}>新規スポットの追加</h3>
          <p style={{fontSize: '0.9rem'}}>住所を入力して検索するか、地図をクリックして場所を指定してください。</p>
          
          <form onSubmit={handleAddSpotSubmit}>
            {/* 住所検索エリア */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', color:'#555'}}>住所から場所を検索:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="例: 東京都千代田区1-1" 
                  value={newSpot.address} 
                  onChange={e => setNewSpot({...newSpot, address: e.target.value})}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter') { 
                      e.preventDefault(); 
                      handleSearchAddress(); 
                    }
                  }}
                  style={{ flexGrow: 1, padding: '8px' }}
                />
                <button 
                  type="button" 
                  onClick={handleSearchAddress}
                  disabled={isSearchingAddress || !newSpot.address}
                  style={{
                    backgroundColor: isSearchingAddress ? '#ccc' : '#8c7853',
                    color: '#fff', border: 'none', padding: '0 20px', borderRadius: '4px', cursor: 'pointer'
                  }}
                >
                  {isSearchingAddress ? '検索中...' : '検索'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom:'10px' }}>
               <label style={{fontWeight:'bold', color:'#555'}}>スポット名:</label>
              <input 
                type="text" 
                placeholder="場所の名前 (必須)" 
                value={newSpot.name} 
                onChange={e => setNewSpot({...newSpot, name: e.target.value})}
                required
                style={{padding: '8px'}}
              />
            </div>

            <textarea 
              placeholder="説明やコメント" 
              value={newSpot.nearbyInfo} 
              onChange={e => setNewSpot({...newSpot, nearbyInfo: e.target.value})}
              style={{width: '100%', padding: '8px', marginTop: '10px', height: '60px'}}
            />
            <div style={{marginTop: '10px'}}>
              <label>写真: </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setNewSpot({...newSpot, image: e.target.files[0]})}
              />
            </div>
            
            <div style={{marginTop: '10px', fontWeight: 'bold', color: newSpot.lat ? '#4CAF50' : '#f00'}}>
              位置情報: {newSpot.lat ? 'OK (設定済み)' : '住所を検索するか、地図をクリックしてください'}
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting || !newSpot.lat}
              style={{
                width: '100%', padding: '10px', marginTop: '15px',
                backgroundColor: isSubmitting ? '#ccc' : '#e07a5f',
                color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer'
              }}
            >
              {isSubmitting ? '送信中...' : 'このスポットを投稿する'}
            </button>
          </form>
        </div>
      )}

      {/* Google Map */}
      <div style={{ marginBottom: '40px' }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={10}
            center={mapData.spots.length > 0 ? {lat: mapData.spots[0].latitude, lng: mapData.spots[0].longitude} : {lat: 35.689, lng: 139.692}}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{
              draggableCursor: isAddingMode ? 'crosshair' : '',
            }}
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

            {isAddingMode && newSpot.lat && (
              <Marker
                position={{ lat: newSpot.lat, lng: newSpot.lng }}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
                }}
              />
            )}

            {selectedSpot && (
              <InfoWindow
                position={{ lat: selectedSpot.latitude, lng: selectedSpot.longitude }}
                onCloseClick={() => setSelectedSpot(null)}
              >
                <div style={{ color: '#333', padding: '5px' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{selectedSpot.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{selectedSpot.address}</p>
                  {/* InfoWindow内にも投稿者を表示 */}
                  <p style={{fontSize:'0.8rem', color:'#666', marginTop:'5px'}}>
                    投稿者: {selectedSpot.username || '匿名'}
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : <p>Map Loading...</p>}
      </div>

      {/* スポット詳細リスト */}
      <div>
        <h3 style={{ borderBottom: '2px solid #8c7853', paddingBottom: '10px', color: '#4a3b2a' }}>
          📍 みんなの投稿スポット一覧
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
              <div style={{ 
                marginRight: '20px', 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#8c7853',
                minWidth: '30px'
              }}>
                {index + 1}.
              </div>

              <div style={{ flex: 1 }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <h4 style={{ margin: '0 0 5px 0', fontSize: '1.3rem', color: '#4a3b2a' }}>
                     {spot.name}
                   </h4>
                   {/* ★追加: ユーザーネーム表示 */}
                   <span style={{ fontSize: '0.85rem', color: '#888', backgroundColor: '#f0f0f0', padding: '3px 8px', borderRadius: '10px' }}>
                     👤 {spot.username || '匿名ユーザー'}
                   </span>
                </div>
                
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

                <a 
                  href={`http://maps.google.com/maps?q=${spot.latitude},${spot.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    backgroundColor: '#4285F4',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    marginTop: '10px'
                  }}
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