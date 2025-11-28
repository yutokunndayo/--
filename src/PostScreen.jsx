import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PostScreen() {
  const navigate = useNavigate();
  const [workTitle, setWorkTitle] = useState('');
  const [mapTitle, setMapTitle] = useState('');
  const [imageFile, setImageFile] = useState(null); // 画像ファイル
  const [spots, setSpots] = useState([]);
  
  const [spotName, setSpotName] = useState('');
  const [spotLat, setSpotLat] = useState('');
  const [spotLng, setSpotLng] = useState('');

  const handleAddSpot = () => {
    if (!spotName || !spotLat || !spotLng) return;
    const newSpot = { id: spots.length + 1, name: spotName, lat: parseFloat(spotLat), lng: parseFloat(spotLng) };
    setSpots([...spots, newSpot]);
    setSpotName(''); setSpotLat(''); setSpotLng('');
  };

  const handleSubmitMap = async (e) => {
    e.preventDefault();
    
    // ★FormDataでデータをまとめる
    const formData = new FormData();
    formData.append('workTitle', workTitle);
    formData.append('mapTitle', mapTitle);
    formData.append('spots', JSON.stringify(spots)); // 配列は文字列化
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      // headersを指定しない（ブラウザが自動設定）
      const response = await fetch('http://localhost:3000/api/pilgrimages', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
      
      alert('保存しました！');
      navigate('/home');
    } catch (err) {
      alert(`保存失敗: ${err.message}`);
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
        {/* 画像選択欄 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label>カバー画像:</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ border: 'none' }} />
        </div>
        <hr />
        <h3>聖地スポットを追加</h3>
        <div style={{ marginBottom: '1rem' }}>
          <input type="text" value={spotName} onChange={(e) => setSpotName(e.target.value)} placeholder="場所名" />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
          <input type="number" value={spotLat} onChange={(e) => setSpotLat(e.target.value)} placeholder="緯度" />
          <input type="number" value={spotLng} onChange={(e) => setSpotLng(e.target.value)} placeholder="経度" />
        </div>
        <button type="button" onClick={handleAddSpot}>このスポットを追加</button>
        <h4>追加済み: {spots.length}件</h4>
        <ul>{spots.map(s => <li key={s.id}>{s.name}</li>)}</ul>
        <hr />
        <button type="submit" disabled={spots.length === 0}>保存する</button>
      </form>
    </div>
  );
}
export default PostScreen;