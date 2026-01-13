import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // ★useNavigate追加
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

function ViewScreen() {
  const { pilgrimageId } = useParams();
  const navigate = useNavigate(); // ★画面移動用
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });

  // ★ログイン中のユーザー名を取得
  const currentUser = localStorage.getItem('username');

  useEffect(() => {
    fetch(`http://localhost:3000/api/pilgrimages/${pilgrimageId}`).then(r=>r.json()).then(setData);
  }, [pilgrimageId]);

  // ★削除ボタンの処理
  const handleDelete = async () => {
    if(!window.confirm('本当にこのマップを削除しますか？')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/pilgrimages/${pilgrimageId}`, { method: 'DELETE' });
      if(res.ok) {
        alert('削除しました');
        navigate('/home');
      } else {
        alert('削除に失敗しました');
      }
    } catch(e) { console.error(e); }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/home">←戻る</Link>
      
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
        <div>
          <h2>{data.mapTitle}</h2>
          <p style={{fontSize:'0.8em', color:'#666'}}>作者: {data.author || '不明'} ({data.workTitle})</p>
        </div>
        
        {/* ★作者本人の場合のみ削除ボタンを表示 */}
        {data.author === currentUser && (
          <button onClick={handleDelete} style={{backgroundColor:'#ff4444', color:'white', border:'none', padding:'5px 10px', cursor:'pointer'}}>
            削除する
          </button>
        )}
      </div>

      {isLoaded && <GoogleMap mapContainerStyle={{width:'100%', height:'400px'}} center={{lat:35.689, lng:139.692}} zoom={12} onLoad={(map)=>{
        if (data.spots.length === 1) {
             map.setCenter({ lat: Number(data.spots[0].latitude), lng: Number(data.spots[0].longitude) });
             map.setZoom(12);
        } else if (data.spots.length > 1) {
            const b = new window.google.maps.LatLngBounds();
            data.spots.forEach(s => b.extend({lat: s.latitude, lng: s.longitude}));
            map.fitBounds(b);
        }
      }}>
        {data.spots.map(s => <Marker key={s.id} position={{lat: s.latitude, lng: s.longitude}} onClick={()=>setSelected(s)} />)}
        {selected && <InfoWindow position={{lat: selected.latitude, lng: selected.longitude}} onCloseClick={()=>setSelected(null)}>
          <div>
            <h4>{selected.name}</h4>
            {selected.image_path && <img src={`http://localhost:3000/${selected.image_path}`} style={{width:'100px'}} />}
          </div>
        </InfoWindow>}
      </GoogleMap>}
      
      {/* (リスト表示部分は省略してもOKですが、ViewScreen全体を上書きする場合はそのまま残してください) */}
       <div style={{marginTop:'20px'}}>
        {data.spots.map(s => (
          <div key={s.id} style={{border:'1px solid #ccc', padding:'10px', marginBottom:'10px'}}>
            <h4>{s.name}</h4>
            {s.nearby_info && <p>📝 {s.nearby_info}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
export default ViewScreen;