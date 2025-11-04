import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PostScreen() {
  const navigate = useNavigate();

  // 聖地巡礼マップ全体の情報
  const [workTitle, setWorkTitle] = useState(''); // 作品名
  const [mapTitle, setMapTitle] = useState(''); // マップ名

  // 追加した聖地スポットのリスト
  const [spots, setSpots] = useState([]);

  // 一時的に入力中のスポット情報
  const [spotName, setSpotName] = useState('');
  const [spotLat, setSpotLat] = useState(''); // 緯度 (ダミー入力)
  const [spotLng, setSpotLng] = useState(''); // 経度 (ダミー入力)

  // 「スポット追加」ボタンが押された時の処理
  const handleAddSpot = () => {
    if (!spotName || !spotLat || !spotLng) {
      alert('すべてのスポット情報を入力してください');
      return;
    }
    
    // 新しいスポットをリストに追加
    const newSpot = {
      id: spots.length + 1, // ダミーID
      name: spotName,
      lat: parseFloat(spotLat),
      lng: parseFloat(spotLng),
    };
    setSpots([...spots, newSpot]);

    // 入力欄をクリア
    setSpotName('');
    setSpotLat('');
    setSpotLng('');
  };

  // 「聖地マップを保存」ボタンが押された時の処理
  const handleSubmitMap = (e) => {
    e.preventDefault();
    
    const pilgrimageMapData = {
      workTitle,
      mapTitle,
      spots, // スポットのリスト
    };

    // TODO: ここでAPIにデータを送信する
    console.log('保存する聖地巡礼マップデータ:', pilgrimageMapData);
    alert('聖地マップを保存しました！（実際はAPIに送信します）');
    
    navigate('/home'); // ホームに戻る
  };

  return (
    <div>
      <h2>聖地巡礼マップを作成する</h2>
      
      {/* マップ全体の情報入力フォーム */}
      <form onSubmit={handleSubmitMap}>
        <div>
          <label>作品名:</label>
          <input
            type="text"
            value={workTitle}
            onChange={(e) => setWorkTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>マップのタイトル:</label>
          <input
            type="text"
            value={mapTitle}
            onChange={(e) => setMapTitle(e.target.value)}
            required
          />
        </div>

        <hr />

        {/* スポット追加セクション */}
        <h3>聖地スポットを追加</h3>
        <p>（APIキー導入後はここが地図操作になります）</p>
        <div>
          <label>場所名:</label>
          <input type="text" value={spotName} onChange={(e) => setSpotName(e.target.value)} />
        </div>
        <div>
          <label>緯度(ダミー):</label>
          <input type="number" value={spotLat} onChange={(e) => setSpotLat(e.target.value)} />
        </div>
        <div>
          <label>経度(ダミー):</label>
          <input type="number" value={spotLng} onChange={(e) => setSpotLng(e.target.value)} />
        </div>
        <button type="button" onClick={handleAddSpot}>
          このスポットを追加
        </button>

        {/* 追加済みスポット一覧 */}
        <h4>追加したスポット ({spots.length}件)</h4>
        <ul>
          {spots.map((spot) => (
            <li key={spot.id}>
              {spot.name} (緯度: {spot.lat}, 経度: {spot.lng})
            </li>
          ))}
        </ul>

        <hr />
        
        <button type="submit" disabled={spots.length === 0}>
          聖地マップを保存する
        </button>
      </form>
    </div>
  );
}

export default PostScreen;