import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); // フォームのデフォルト送信を防ぐ

    // TODO: ここでAPIにデータを送信する
    // fetch('/api/memories', { method: 'POST', body: JSON.stringify({ title, content }) })
    
    console.log('保存するデータ:', { title, content });
    alert('投稿しました！（実際はAPIに送信します）');
    
    // 投稿が終わったらホーム画面に戻る
    navigate('/home');
  };

  return (
    <div>
      <h2>思い出を投稿する</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>タイトル:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '80%', margin: '10px' }}
          />
        </div>
        <div>
          <label>内容:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{ width: '80%', height: '150px', margin: '10px' }}
          />
        </div>
        <button type="submit">保存する</button>
      </form>
    </div>
  );
}

export default PostScreen;