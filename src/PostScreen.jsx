import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PostScreen() {
  const navigate = useNavigate();

  // 入力フォームの状態（スポット情報は削除）
  const [workTitle, setWorkTitle] = useState('');
  const [mapTitle, setMapTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 保存ボタン
  const handleSubmitMap = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('workTitle', workTitle);
    formData.append('mapTitle', mapTitle);
    if (coverImage) formData.append('coverImage', coverImage);

    const userId = localStorage.getItem('userId');
    if (userId) formData.append('userId', userId);

    // スポットは空の配列として送信（バックエンドのエラーを防ぐため）
    formData.append('spots', JSON.stringify([]));

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const response = await fetch(`${API_URL}/api/pilgrimages`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
      
      const data = await response.json();
      alert('タイトルを作成しました！次はスポットを登録しましょう。');
      
      // 作成完了後、そのマップの詳細画面へ移動して、すぐにスポット追加できるようにする
      if (data.pilgrimageId) {
        navigate(`/view/${data.pilgrimageId}`);
      } else {
        navigate('/home');
      }

    } catch (err) { 
      console.error(err);
      alert(`保存失敗: ${err.message}`); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: '#4a3a2a' }}>新しいタイトル（枠）を作成</h2>
      <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
        みんなで作り上げる聖地巡礼マップの<br />
        新しい「タイトル」を作成します。
      </p>

      <form onSubmit={handleSubmitMap} style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a3a2a' }}>
            作品名 <span style={{ color: '#e07a5f', fontSize: '0.8em' }}>(必須)</span>
          </label>
          <input 
            type="text" 
            value={workTitle} 
            onChange={(e) => setWorkTitle(e.target.value)} 
            required 
            placeholder="例: 君の名は。" 
            style={{ width: '100%', padding: '12px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a3a2a' }}>
            マップのタイトル <span style={{ color: '#e07a5f', fontSize: '0.8em' }}>(必須)</span>
          </label>
          <input 
            type="text" 
            value={mapTitle} 
            onChange={(e) => setMapTitle(e.target.value)} 
            required 
            placeholder="例: 飛騨古川 聖地巡礼マップ" 
            style={{ width: '100%', padding: '12px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a3a2a' }}>
            カバー画像 <span style={{ color: '#999', fontSize: '0.8em' }}>(任意)</span>
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setCoverImage(e.target.files[0])} 
            style={{ width: '100%', padding: '5px' }} 
          />
          <p style={{ fontSize: '0.85em', color: '#888', marginTop: '5px' }}>
            ※一覧画面やヘッダーに表示されます。
          </p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          style={{ 
            padding: '15px', 
            fontSize: '1.1em',
            width: '100%',
            backgroundColor: isSubmitting ? '#ccc' : '#8c7853', 
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isSubmitting ? 'wait' : 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {isSubmitting ? '作成中...' : 'このタイトルを作成する'}
        </button>
      </form>
    </div>
  );
}
export default PostScreen;