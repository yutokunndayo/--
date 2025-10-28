import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ダミーデータ（本来はAPIから取得する）
const dummyMemories = [
  { id: 1, title: '京都の紅葉狩り' },
  { id: 2, title: '沖縄の美ら海水族館' },
  { id: 3, title: '北海道のグルメ旅' },
];

function HomeScreen() {
  // stateで投稿一覧を管理する
  const [memories, setMemories] = useState([]);

  // 起動時にダミーデータをセット
  useEffect(() => {
    // TODO: ここでAPIを叩いてデータを取得する
    // fetch('/api/memories')
    setMemories(dummyMemories);
  }, []); // [] は初回マウント時のみ実行するという意味

  return (
    <div>
      <h2>みんなの思い出</h2>
      <div className="memory-list">
        {memories.map((memory) => (
          <div key={memory.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            {/* Linkコンポーネントで閲覧画面へ飛ぶ */}
            <Link to={`/view/${memory.id}`}>
              <h3>{memory.title}</h3>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeScreen;