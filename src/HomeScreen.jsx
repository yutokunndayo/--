import React, { useState, useEffect } from 'react'; // useEffect をインポート
import { Link } from 'react-router-dom';

function HomeScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // === データを保持する state を3つ用意 ===
  const [pilgrimages, setPilgrimages] = useState([]); // APIから取得したデータ本体
  const [isLoading, setIsLoading] = useState(true);   // ローディング中か
  const [error, setError] = useState(null);           // エラー情報

  // === useEffectフック: コンポーネントが読み込まれた時に1回だけ実行 ===
  useEffect(() => {
    // APIを叩いてデータを取得
    fetch('http://localhost:3000/api/pilgrimages')
      .then(response => {
        if (!response.ok) {
          throw new Error('ネットワークの応答がありませんでした');
        }
        return response.json();
      })
      .then(data => {
        // 取得したデータを state に保存
        setPilgrimages(data);
        setIsLoading(false); // ローディング完了
      })
      .catch(err => {
        // エラーが発生した場合
        console.error('データの取得に失敗しました:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []); // [] が空の場合、マウント時に1回だけ実行

  // === 検索フィルタリング ===
  // フィルタリング対象をダミーデータから、stateの `pilgrimages` に変更
  const filteredMaps = pilgrimages.filter((map) => {
    const workLower = map.work.toLowerCase();
    const titleLower = map.title.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return workLower.includes(searchLower) || titleLower.includes(searchLower);
  });

  // === ローディング中・エラー時の表示 ===
  if (isLoading) {
    return <div style={{ textAlign: 'center' }}>データを読み込み中です...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', color: 'red' }}>エラー: {error}</div>;
  }

  // === 通常時の表示 ===
  return (
    <div>
      <h2>聖地巡礼マップを探す</h2>

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="作品名やマップ名で検索..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="pilgrimage-list">
        {filteredMaps.length > 0 ? (
          filteredMaps.map((map) => (
            <div key={map.id} className="list-item-box">
              <Link to={`/view/${map.id}`}>
                <h3>{map.title}</h3>
                <p>（作品名: {map.work}）</p>
              </Link>
            </div>
          ))
        ) : (
          <p className="no-results-text">
            該当するマップが見つかりません。
          </p>
        )}
      </div>
    </div>
  );
}

export default HomeScreen;