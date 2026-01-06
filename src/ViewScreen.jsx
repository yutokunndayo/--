import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// Google Mapsの部品をインポート
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  backgroundColor: '#ddd',
  marginBottom: '30px',
  border: '1px solid #ccc'
};

function ViewScreen() {
  const { pilgrimageId } = useParams();
  const [pilgrimage, setPilgrimage] = useState(null);

  // APIキー読み込み
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // バックエンドから詳細データを取得
  useEffect(() => {
    // GET APIはまだ作っていないので、前回同様ダミーデータで動作させます
    // (ただし、GoogleMapの動作確認のため、座標はリアルな値を使います)
    const dummyData = {
      id: pilgrimageId,
      workTitle: 'IWGP',
      mapTitle: '池袋西口公園 聖地巡礼コース',
      author: '聖地ハンターA',
      date: '2023-11-25',
      spots: [
        // ピンを表示するために座標を指定
        { id: 1, name: '池袋西口公園', lat: 35.730, lng: 139.709, desc: 'ドラマのオープニングでおなじみの場所。' },
        { id: 2, name: '東京芸術劇場', lat: 35.729, lng: 139.708, desc: 'マコトが座っていたベンチ付近。' },
        { id: 3, name: '池袋駅西口交番', lat: 35.731, lng: 139.710, desc: '作中で何度も登場する交番前。' },
      ],
    };
    setPilgrimage(dummyData);
  }, [pilgrimageId]);

  if (!pilgrimage) return <div>読み込み中...</div>;

  // 地図の中心を計算（1つ目のスポットにする）
  const mapCenter = pilgrimage.spots.length > 0 
    ? { lat: pilgrimage.spots[0].lat, lng: pilgrimage.spots[0].lng }
    : { lat: 35.689, lng: 139.692 }; // デフォルト(新宿)

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <Link to="/home">&lt; ホームに戻る</Link>
      </div>

      <div className="view-header">
        <span style={{ color: '#8c7853', fontWeight: 'bold' }}>{pilgrimage.workTitle} の聖地</span>
        <div className="view-title-area">
          <h2>{pilgrimage.mapTitle}</h2>
        </div>
        <div className="view-meta">
          <span>作成者: {pilgrimage.author}</span> | <span>スポット数: {pilgrimage.spots.length}件</span>
        </div>
      </div>

      <div className="view-tabs">
        <div className="view-tab active">地図・ルート</div>
        <div className="view-tab">スポット一覧</div>
      </div>

      {/* 地図表示エリア */}
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15} // ズームレベル（数字が大きいほど拡大）
        >
          {/* スポットの数だけピンを立てる */}
          {pilgrimage.spots.map((spot, index) => (
            <Marker
              key={spot.id}
              position={{ lat: spot.lat, lng: spot.lng }}
              label={{
                text: (index + 1).toString(), // ピンに「1」「2」と番号を表示
                color: "white",
                fontWeight: "bold"
              }}
            />
          ))}
        </GoogleMap>
      ) : (
        <div>地図を読み込み中...</div>
      )}

      <h3 style={{ borderBottom: '2px solid #d8c8b0', paddingBottom: '5px' }}>巡礼スポット一覧</h3>
      <table className="spots-table">
        <tbody>
          {pilgrimage.spots.map((spot, index) => (
            <tr key={spot.id} className="spot-row">
              <th>
                <div style={{ background:'#4a3a2a', color:'#fff', width:'24px', height:'24px', textAlign:'center', borderRadius:'50%' }}>
                  {index + 1}
                </div>
              </th>
              <td>
                <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{spot.name}</div>
                <div style={{ color: '#7a6a5a', fontSize: '0.9em', marginTop: '5px' }}>{spot.desc}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewScreen;