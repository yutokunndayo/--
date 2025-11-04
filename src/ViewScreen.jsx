import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ViewScreen() {
  const { pilgrimageId } = useParams(); // URLからIDを取得
  
  // 聖地巡礼マップのデータ（本来はAPIから取得）
  const [pilgrimage, setPilgrimage] = useState(null);

  useEffect(() => {
    // TODO: ここで pilgrimageId を使ってAPIからデータを取得する
    // fetch(`/api/pilgrimage/${pilgrimageId}`)
    console.log(`ID: ${pilgrimageId} の聖地マップデータを取得中...`);
    
    // ダミーのデータ取得処理
    const dummyData = {
      id: pilgrimageId,
      workTitle: 'ダミー作品名',
      mapTitle: `ID ${pilgrimageId} の聖地巡礼マップ`,
      author: 'UserA',
      spots: [
        { id: 1, name: '聖地スポットA', lat: 35.681, lng: 139.767 },
        { id: 2, name: '聖地スポットB', lat: 35.658, lng: 139.745 },
        { id: 3, name: '聖地スポットC', lat: 35.710, lng: 139.776 },
      ],
    };
    setPilgrimage(dummyData);
    
  }, [pilgrimageId]); // pilgrimageId が変わったら再実行

  if (!pilgrimage) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h3>{pilgrimage.workTitle}</h3>
      <h2>{pilgrimage.mapTitle}</h2>
      <p>作成者: {pilgrimage.author}</p>
      
      <div 
        style={{ 
          width: '100%', 
          height: '300px', 
          backgroundColor: '#eee', 
          border: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        （ここにAPIキー導入後、地図が表示されます）
      </div>

      <h3>聖地スポット一覧（全 {pilgrimage.spots.length} 件）</h3>
      <ul>
        {pilgrimage.spots.map((spot) => (
          <li key={spot.id}>
            <strong>{spot.name}</strong> (緯度: {spot.lat}, 経度: {spot.lng})
          </li>
        ))}
      </ul>
      
      <br />
      <Link to="/home">ホームに戻る</Link>
    </div>
  );
}

export default ViewScreen;