import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PostScreen() {
  const navigate = useNavigate();

  // (workTitle, mapTitle, spots, spotName などの useState はそのまま変更なし)
  const [workTitle, setWorkTitle] = useState(''); // 作品名
  const [mapTitle, setMapTitle] = useState(''); // マップ名
  const [spots, setSpots] = useState([]);
  const [spotName, setSpotName] = useState('');
  const [spotLat, setSpotLat] = useState(''); // 緯度 (ダミー入力)
  const [spotLng, setSpotLng] = useState(''); // 経度 (ダミー入力)

  // (handleAddSpot 関数もそのまま変更なし)
  const handleAddSpot = () => {
    if (!spotName || !spotLat || !spotLng) {
      alert('すべてのスポット情報を入力してください');
      return;
    }
    const newSpot = {
      id: spots.length + 1,
      name: spotName,
      lat: parseFloat(spotLat),
      lng: parseFloat(spotLng),
    };
    setSpots([...spots, newSpot]);
    setSpotName('');
    setSpotLat('');
    setSpotLng('');
  };

  
  // === ↓↓↓ この「聖地マップを保存」の関数をまるごと書き換えます ↓↓↓ ===
  
  const handleSubmitMap = async (e) => {
    e.preventDefault(); // フォームのデフォルト送信を停止
    
    // 1. 送信するデータオブジェクトを作成
    const pilgrimageMapData = {
      workTitle,
      mapTitle,
      spots, // スポットのリスト
    };

    console.log('バックエンドにこのデータを送信します:', pilgrimageMapData);

    try {
      // 2. fetch APIを使ってPOSTリクエストを送信
      const response = await fetch('http://localhost:3000/api/pilgrimages', {
        method: 'POST', // POSTメソッドを指定
        headers: {
          // 送信 B するデータはJSON形式であることを明記
          'Content-Type': 'application/json',
        },
        // JavaScriptオブジェクトをJSON文字列に変換して body に詰める
        body: JSON.stringify(pilgrimageMapData),
      });

      if (!response.ok) {
        // サーバー側でエラーが起きた場合 (例: 500エラー)
        throw new Error(`サーバーエラー: ${response.status}`);
      }

      // 3. サーバーからの成功応答をJSONとして解析
      const result = await response.json();

      console.log('サーバーからの応答:', result);
      alert('聖地マップが正常に保存されました！');
      
      // 4. 保存が成功したらホーム画面に戻る
      navigate('/home');

    } catch (err) {
      // ネットワークエラーやJSON解析エラーなど
      console.error('マップの保存に失敗しました:', err);
      alert(`エラーが発生しました: ${err.message}`);
    }
  };

  // (return ( ... ) 以下のJSXは変更なしです)
  return (
    <div>
      <h2>聖地巡礼マップを作成する</h2>
      
      {/* マップ全体の情報入力フォーム (onSubmitで handleSubmitMap を呼び出す) */}
      <form onSubmit={handleSubmitMap}>
        
        {/* === フォームの入力欄 (1) === */}
        {/* index.css で input, textarea のスタイルは設定済みなので、
          className を指定しなくてもセピア調になります。
        */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="work-title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            作品名:
          </label>
          <input
            id="work-title"
            type="text"
            value={workTitle}
            onChange={(e) => setWorkTitle(e.target.value)}
            required
            placeholder="例: 作品A"
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="map-title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            マップのタイトル:
          </label>
          <input
            id="map-title"
            type="text"
            value={mapTitle}
            onChange={(e) => setMapTitle(e.target.value)}
            required
            placeholder="例: 東京聖地巡礼マップ"
          />
        </div>

        <hr style={{ border: 'none', borderBottom: '1px solid #c9b8a0', margin: '2rem 0' }} />

        {/* === スポット追加セクション (2) === */}
        <h3>聖地スポットを追加</h3>
        <p style={{ fontSize: '0.9em', color: '#7a6a5a', marginTop: '-10px' }}>
          （APIキー導入後はここが地図操作になります）
        </p>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="spot-name" style={{ display: 'block', marginBottom: '5px' }}>場所名:</label>
          <input 
            id="spot-name"
            type="text" 
            value={spotName} 
            onChange={(e) => setSpotName(e.target.value)} 
            placeholder="例: 東京タワー"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="spot-lat" style={{ display: 'block', marginBottom: '5px' }}>緯度(ダミー):</label>
          <input 
            id="spot-lat"
            type="number" 
            value={spotLat} 
            onChange={(e) => setSpotLat(e.target.value)} 
            placeholder="例: 35.6585"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="spot-lng" style={{ display: 'block', marginBottom: '5px' }}>経度(ダミー):</label>
          <input 
            id="spot-lng"
            type="number" 
            value={spotLng} 
            onChange={(e) => setSpotLng(e.target.value)} 
            placeholder="例: 139.7454"
          />
        </div>
        {/* 「type="button"」が重要です（これを押してもフォームが送信されないようにする） */}
        <button type="button" onClick={handleAddSpot} style={{ marginBottom: '1.5rem' }}>
          このスポットを追加
        </button>

        {/* === 追加したスポット一覧 (3) === */}
        <h4>追加したスポット ({spots.length}件)</h4>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
          {/* spots 配列の中身を map でループして表示 */}
          {spots.map((spot) => (
            <li key={spot.id} style={{ marginBottom: '10px' }}>
              <strong>{spot.name}</strong>
              <span style={{ fontSize: '0.9em', color: '#7a6a5a' }}>
                 (緯度: {spot.lat}, 経度: {spot.lng})
              </span>
            </li>
          ))}
          {/* 0件の場合のメッセージ */}
          {spots.length === 0 && (
            <p style={{ color: '#7a6a5a' }}>まだスポットが追加されていません。</p>
          )}
        </ul>

        <hr style={{ border: 'none', borderBottom: '1px solid #c9b8a0', margin: '2rem 0' }} />
        
        {/* === 保存ボタン (4) === */}
        {/* 「type="submit"」で、これを押すとフォームが送信(onSubmit)されます。
          spotsが0件の場合はボタンを押せないようにします。
        */}
        <button type="submit" disabled={spots.length === 0} style={{ width: '100%', padding: '15px', fontSize: '1.2em' }}>
          聖地マップを保存する
        </button>
      </form>
    </div>
  );
  // === ↑↑↑ ここまでが return 文の終わりです ↑↑↑
}

export default PostScreen;