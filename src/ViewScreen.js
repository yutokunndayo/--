import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ViewScreen() {
  // URLの :memoryId (App.jsで設定) を取得する
  const { memoryId } = useParams();
  
  // ダミーデータ（本来はAPIから取得）
  const [memory, setMemory] = useState(null);

  useEffect(() => {
    // TODO: ここで memoryId を使ってAPIから「特定の」データを取得する
    // fetch(`/api/memories/${memoryId}`)
    console.log(`ID: ${memoryId} のデータを取得中...`);
    
    // ダミーの取得処理
    const dummyData = {
      id: memoryId,
      title: `ID ${memoryId} の思い出タイトル`,
      content: `これがID ${memoryId} の思い出の本文です。素晴らしい旅行でした。`,
      author: 'UserA',
    };
    setMemory(dummyData);
    
  }, [memoryId]); // memoryId が変わったら再実行

  if (!memory) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h2>{memory.title}</h2>
      <p>投稿者: {memory.author}</p>
      <hr />
      <p style={{ whiteSpace: 'pre-wrap' }}>{memory.content}</p>
      
      <br />
      <Link to="/home">ホームに戻る</Link>
    </div>
  );
}

export default ViewScreen;