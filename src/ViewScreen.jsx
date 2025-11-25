import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ViewScreen() {
  const { pilgrimageId } = useParams();
  const [pilgrimage, setPilgrimage] = useState(null);

  useEffect(() => {
    // 本来はAPIから詳細情報を取得
    console.log(`ID: ${pilgrimageId} の詳細取得`);
    
    // ダミーデータ (スポット数などを増やして表示確認)
    const dummyData = {
      id: pilgrimageId,
      workTitle: 'IWGP',
      mapTitle: '池袋西口公園 聖地巡礼コース',
      author: '聖地ハンターA',
      date: '2023-11-25',
      spots: [
        { id: 1, name: '池袋西口公園 (Global Ring)', lat: 35.730, lng: 139.709, desc: 'ドラマのオープニングでおなじみの場所。' },
        { id: 2, name: '東京芸術劇場', lat: 35.729, lng: 139.708, desc: 'マコトが座っていたベンチ付近。' },
        { id: 3, name: '池袋駅西口交番', lat: 35.731, lng: 139.710, desc: '作中で何度も登場する交番前。' },
      ],
    };
    setPilgrimage(dummyData);
  }, [pilgrimageId]);

  if (!pilgrimage) return <div>読み込み中...</div>;

  return (
    <div>
      {/* パンくずリスト風の戻るリンク */}
      <div style={{ marginBottom: '10px' }}>
        <Link to="/home">&lt; ホームに戻る</Link>
      </div>

      {/* 1. ヘッダー情報エリア */}
      <div className="view-header">
        <span style={{ color: '#8c7853', fontWeight: 'bold' }}>
          {pilgrimage.workTitle} の聖地
        </span>
        <div className="view-title-area">
          <h2>{pilgrimage.mapTitle}</h2>
        </div>
        <div className="view-meta">
          <span>作成者: {pilgrimage.author}</span>
          <span style={{ margin: '0 10px' }}>|</span>
          <span>作成日: {pilgrimage.date}</span>
          <span style={{ margin: '0 10px' }}>|</span>
          <span>スポット数: {pilgrimage.spots.length}件</span>
        </div>
      </div>

      {/* 2. タブ風メニュー (見た目だけ) */}
      <div className="view-tabs">
        <div className="view-tab active">地図・ルート</div>
        <div className="view-tab">スポット一覧</div>
        <div className="view-tab">写真</div>
        <div className="view-tab">口コミ</div>
      </div>

      {/* 3. 地図エリア */}
      <div 
        style={{ 
          width: '100%', 
          height: '350px', 
          backgroundColor: '#ddd', 
          marginBottom: '30px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px solid #ccc'
        }}
      >
        <p style={{ color: '#555' }}>
          （ここに Google Map が表示されます）<br/>
          APIキーを設定するとピンが表示されます
        </p>
      </div>

      {/* 4. スポット一覧エリア */}
      <h3 style={{ borderBottom: '2px solid #d8c8b0', paddingBottom: '5px' }}>
        巡礼スポット一覧
      </h3>
      <table className="spots-table">
        <tbody>
          {pilgrimage.spots.map((spot, index) => (
            <tr key={spot.id} className="spot-row">
              <th>
                <div style={{ 
                  background:'#4a3a2a', color:'#fff', 
                  width:'24px', height:'24px', 
                  textAlign:'center', borderRadius:'50%' 
                }}>
                  {index + 1}
                </div>
              </th>
              <td>
                <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                  {spot.name}
                </div>
                <div style={{ color: '#7a6a5a', fontSize: '0.9em', marginTop: '5px' }}>
                  {spot.desc}
                </div>
                <div style={{ fontSize: '0.8em', color: '#999', marginTop: '5px' }}>
                  緯度: {spot.lat} / 経度: {spot.lng}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default ViewScreen;