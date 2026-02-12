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

// デフォルトの中心位置（データがない場合の初期値）
const DEFAULT_CENTER = { lat: 35.689, lng: 139.692 };

function ViewScreen() {
  const { pilgrimageId } = useParams();
  
  // --- State定義 ---
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 地図の中心位置を管理（勝手に戻らないようにするため）
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  // マップ操作・表示用
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [map, setMap] = useState(null);

  // 新規スポット投稿用
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
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  
  // 交流ノート（コメント）用
  const [openCommentSpotId, setOpenCommentSpotId] = useState(null); // 開いているスポットID
  const [comments, setComments] = useState([]); // コメントリスト
  const [newComment, setNewComment] = useState(''); // 入力中のコメント

  // ユーザー情報
  const isLoggedIn = !!localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  // Google Maps API読み込み
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // --- データ取得 ---
  const fetchMapData = useCallback(() => {
    fetch(`http://localhost:3000/api/pilgrimages/${pilgrimageId}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setMapData(data);
        // 初回ロード時のみ、データがあればそこを中心にする（すでにcenterが動いている場合は上書きしない）
        if (loading && data.spots && data.spots.length > 0) {
          setMapCenter({ lat: data.spots[0].latitude, lng: data.spots[0].longitude });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [pilgrimageId, loading]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  // --- マップ関連ハンドラ ---
  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // データ読み込み時にピン全体が収まるようにズーム調整（初回のみ）
  useEffect(() => {
    if (map && mapData && mapData.spots.length > 0 && !isAddingMode) {
      const bounds = new window.google.maps.LatLngBounds();
      mapData.spots.forEach(spot => {
        bounds.extend({ lat: spot.latitude, lng: spot.longitude });
      });
      // 地図の中心設定よりもfitBoundsを優先したい場合はコメントアウトを外す
      // map.fitBounds(bounds);
    }
  }, [map, mapData, isAddingMode]);

  const handleMapClick = (e) => {
    if (isAddingMode) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setNewSpot({ ...newSpot, lat, lng });
    }
  };

  // --- 住所検索機能 ---
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
        
        let updatedName = newSpot.name;
        if (!updatedName) updatedName = newSpot.address; // 名前がなければ住所を入れる

        setNewSpot({ ...newSpot, lat, lng, name: updatedName });

        // ★重要: Stateのcenterを更新して、再レンダリング時も位置をキープする
        setMapCenter({ lat, lng });

        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(16);
        }
      } else {
        alert('住所が見つかりませんでした: ' + status);
      }
    });
  };

  // --- スポット投稿機能 ---
  const handleAddSpotSubmit = async (e) => {
    e.preventDefault();
    if (!newSpot.lat || !newSpot.lng) {
      alert('住所検索するか、地図をクリックして場所を指定してください');
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
    if (currentUserId) formData.append('userId', currentUserId);
    if (newSpot.image) formData.append('spotImage', newSpot.image);

    try {
      const res = await fetch(`http://localhost:3000/api/pilgrimages/${pilgrimageId}/spots`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('投稿失敗');

      alert('スポットを追加しました！');
      setIsAddingMode(false);
      setNewSpot({ name: '', address: '', nearbyInfo: '', lat: null, lng: null, image: null });
      fetchMapData(); // 再読み込み
    } catch (err) {
      console.error(err);
      alert('エラー: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 交流ノート機能 ---
  const toggleComments = async (spotId) => {
    if (openCommentSpotId === spotId) {
      setOpenCommentSpotId(null);
      setComments([]);
    } else {
      setOpenCommentSpotId(spotId);
      try {
        const res = await fetch(`http://localhost:3000/api/spots/${spotId}/comments`);
        if (res.ok) setComments(await res.json());
      } catch (e) { console.error(e); }
    }
  };

  const handlePostComment = async (spotId) => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`http://localhost:3000/api/spots/${spotId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, content: newComment })
      });
      if (res.ok) {
        setNewComment('');
        // コメント再読み込み
        const res2 = await fetch(`http://localhost:3000/api/spots/${spotId}/comments`);
        if (res2.ok) setComments(await res2.json());
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteComment = async (commentId, spotId) => {
    if (!window.confirm('削除しますか？')) return;
    try {
      await fetch(`http://localhost:3000/api/comments/${commentId}`, { method: 'DELETE' });
      // コメント再読み込み
      const res = await fetch(`http://localhost:3000/api/spots/${spotId}/comments`);
      if (res.ok) setComments(await res.json());
    } catch (e) { console.error(e); }
  };


  // --- 描画 ---
  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>読み込み中...</div>;
  if (!mapData) return <div style={{textAlign:'center', marginTop:'50px'}}>データが見つかりませんでした</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
      
      {/* ヘッダー */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px dashed #8c7853', paddingBottom: '20px' }}>
        <span style={{ 
          display: 'inline-block', backgroundColor: '#8c7853', color: '#fff', 
          padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', marginBottom: '10px' 
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

      {/* スポット投稿フォーム */}
      {isAddingMode && (
        <div style={{
          backgroundColor: '#fdf6e3', padding: '20px', borderRadius: '8px', 
          border: '2px solid #e07a5f', marginBottom: '20px'
        }}>
          <h3 style={{marginTop: 0, color: '#e07a5f'}}>新規スポットの追加</h3>
          <p style={{fontSize: '0.9rem'}}>住所検索または地図クリックで場所を指定してください。</p>
          
          <form onSubmit={handleAddSpotSubmit}>
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="住所検索 (例: 秋葉原駅)" 
                value={newSpot.address} 
                onChange={e => setNewSpot({...newSpot, address: e.target.value})}
                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSearchAddress(); }}}
                style={{ flexGrow: 1, padding: '8px' }} 
              />
              <button 
                type="button" 
                onClick={handleSearchAddress}
                disabled={isSearchingAddress}
                style={{ backgroundColor: '#8c7853', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '4px', cursor: 'pointer' }}
              >
                検索
              </button>
            </div>
            
            <input 
              type="text" 
              placeholder="スポット名 (必須)" 
              value={newSpot.name} 
              onChange={e => setNewSpot({...newSpot, name: e.target.value})}
              required
              style={{width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box'}} 
            />
            <textarea 
              placeholder="説明やコメント" 
              value={newSpot.nearbyInfo} 
              onChange={e => setNewSpot({...newSpot, nearbyInfo: e.target.value})}
              style={{width: '100%', padding: '8px', marginTop: '10px', height: '60px'}} 
            />
            <div style={{marginTop: '10px'}}>
              <input type="file" accept="image/*" onChange={e => setNewSpot({...newSpot, image: e.target.files[0]})} />
            </div>
            
            <div style={{marginTop: '10px', fontWeight: 'bold', color: newSpot.lat ? '#4CAF50' : '#f00'}}>
              位置情報: {newSpot.lat ? 'OK' : '未設定'}
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
              投稿する
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
            // Stateで管理している center を使用
            center={mapCenter}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{ draggableCursor: isAddingMode ? 'crosshair' : '' }}
          >
            {/* 既存スポットのマーカー */}
            {mapData.spots.map(spot => (
              <Marker
                key={spot.id}
                position={{ lat: spot.latitude, lng: spot.longitude }}
                onClick={() => setSelectedSpot(spot)}
                label={{ text: spot.spot_order.toString(), color: "white", fontWeight: "bold" }}
              />
            ))}

            {/* 新規投稿用のマーカー (青いピン) */}
            {isAddingMode && newSpot.lat && (
              <Marker
                position={{ lat: newSpot.lat, lng: newSpot.lng }}
                icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
              />
            )}

            {/* 情報ウィンドウ */}
            {selectedSpot && (
              <InfoWindow
                position={{ lat: selectedSpot.latitude, lng: selectedSpot.longitude }}
                onCloseClick={() => setSelectedSpot(null)}
              >
                <div style={{ color: '#333', padding: '5px' }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{selectedSpot.name}</h3>
                  <p style={{ margin: 0 }}>{selectedSpot.address}</p>
                  <p style={{fontSize:'0.8rem', color:'#666', marginTop:'5px'}}>投稿者: {selectedSpot.username || '匿名'}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : <p>Map Loading...</p>}
      </div>

      {/* スポット一覧 */}
      <div>
        <h3 style={{ borderBottom: '2px solid #8c7853', paddingBottom: '10px', color: '#4a3b2a' }}>
          📍 みんなの投稿スポット一覧
        </h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {mapData.spots.map((spot, index) => (
            <li key={spot.id} style={{ marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '15px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ marginRight: '20px', fontSize: '1.5rem', fontWeight: 'bold', color: '#8c7853', minWidth: '30px' }}>
                  {index + 1}.
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                     <h4 style={{ margin: '0 0 5px 0', fontSize: '1.3rem', color: '#4a3b2a' }}>{spot.name}</h4>
                     <span style={{ fontSize: '0.85rem', color: '#888', backgroundColor: '#f0f0f0', padding: '3px 8px', borderRadius: '10px' }}>
                       👤 {spot.username || '匿名'}
                     </span>
                  </div>
                  
                  {spot.image_path && (
                    <img src={`http://localhost:3000/${spot.image_path}`} alt={spot.name} style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px', marginBottom:'10px', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                  )}
                  
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '0.95rem', color: '#666' }}>住所: {spot.address}</p>
                  {spot.nearby_info && <p style={{ margin: '0 0 15px 0', fontSize: '1rem', whiteSpace: 'pre-wrap', color: '#333' }}>{spot.nearby_info}</p>}

                  {/* 交流ノートエリア */}
                  <div style={{ marginTop: '15px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                    <button 
                      onClick={() => toggleComments(spot.id)}
                      style={{ background: 'none', border: 'none', color: '#e07a5f', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      💬 デジタル交流ノート {openCommentSpotId === spot.id ? 'を閉じる ▲' : 'を開く ▼'}
                    </button>

                    {openCommentSpotId === spot.id && (
                      <div style={{ marginTop: '10px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                        {comments.length === 0 ? (
                          <p style={{color:'#999', fontSize:'0.9rem'}}>まだ書き込みはありません。一番乗りしよう！</p>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
                            {comments.map(c => (
                              <li key={c.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                                <div style={{ fontSize: '0.85rem', color: '#888', display:'flex', justifyContent:'space-between' }}>
                                    <span>👤 {c.username || '名無しさん'}</span>
                                    <span>{new Date(c.created_at).toLocaleString()}</span>
                                </div>
                                <div style={{ marginTop: '2px', whiteSpace: 'pre-wrap' }}>{c.content}</div>
                                {isLoggedIn && (
                                  <button 
                                    onClick={()=>handleDeleteComment(c.id, spot.id)} 
                                    style={{fontSize:'0.7rem', color:'red', border:'none', background:'none', cursor:'pointer', marginTop:'2px'}}
                                  >
                                    削除
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                          <input 
                            type="text" 
                            placeholder={isLoggedIn ? "コメントを書き込む..." : "ログインしてコメントを書く"} 
                            value={newComment} 
                            onChange={e => setNewComment(e.target.value)}
                            disabled={!isLoggedIn}
                            style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                          <button 
                            onClick={() => handlePostComment(spot.id)}
                            disabled={!isLoggedIn || !newComment}
                            style={{ backgroundColor: '#e07a5f', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', opacity: isLoggedIn ? 1 : 0.5 }}
                          >
                            送信
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <a 
                    href={`http://maps.google.com/maps?q=${spot.latitude},${spot.longitude}`}
                    target="_blank" rel="noopener noreferrer" 
                    style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', backgroundColor: '#4285F4', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '15px' }}
                  >
                    🌏 Google Mapsで開く
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link to="/home" style={{ color: '#8c7853', fontWeight: 'bold', textDecoration: 'none', borderBottom: '1px solid' }}>一覧に戻る</Link>
      </div>
    </div>
  );
}

export default ViewScreen;