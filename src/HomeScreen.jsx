import React, { useState } from 'react'; // useState をインポート
import { Link } from 'react-router-dom';

// ダミーデータ（本来はAPIから取得する聖地巡礼マップ一覧）
const dummyPilgrimages = [
  { id: 1, work: '作品A', title: '東京聖地巡礼マップ' },
  { id: 2, work: '作品B', title: '神奈川聖地巡礼マップ' },
  { id: 3, work: '作品A', title: '京都の舞台探訪' },
  { id: 4, work: '作品C', title: '北海道（映画ロケ地）' },
];

function HomeScreen() {
  // 検索キーワードを保存する state
  const [searchTerm, setSearchTerm] = useState('');

  // 検索キーワードに基づいてダミーデータをフィルタリング
  const filteredMaps = dummyPilgrimages.filter((map) => {
    const workLower = map.work.toLowerCase();
    const titleLower = map.title.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    // 作品名 または マップ名 にキーワードが含まれていれば true を返す
    return workLower.includes(searchLower) || titleLower.includes(searchLower);
  });

  return (
    <div>
      {/* h2 タグは TitleScreen や PostScreen に合わせて 
        App.css の .content に任せる（中央揃えなどしない）
      */}
      <h2>聖地巡礼マップを探す</h2>

      {/* === 検索バーを追加 === */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="作品名やマップ名で検索..."
          className="search-input" // スタイルを当てるためのクラス名
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* === 検索結果のリスト === */}
      <div className="pilgrimage-list">
        {/* filteredMaps の件数によって表示を変える
        */}
        {filteredMaps.length > 0 ? (
          filteredMaps.map((map) => (
            <div key={map.id} className="list-item-box"> {/* 共通スタイルを適用 */}
              <Link to={`/view/${map.id}`}>
                <h3>{map.title}</h3>
                <p>（作品名: {map.work}）</p>
              </Link>
            </div>
          ))
        ) : (
          /* 0件だった場合の表示 */
          <p className="no-results-text">
            該当するマップが見つかりません。
          </p>
        )}
      </div>
    </div>
  );
}

export default HomeScreen;