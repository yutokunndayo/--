import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // === 新規登録ボタンが押された時の処理 ===
  const handleRegister = async (e) => {
    e.preventDefault(); // フォーム送信のデフォルト動作を停止
    if (!username || !password) {
      alert('ユーザー名とパスワードの両方を入力してください。');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(responseText); // "登録失敗" などのサーバーからのエラー
      }
      
      alert('新規登録が完了しました！\n続いて、ログインしてください。');
      // 登録が成功したら、パスワード欄だけ空にする
      setPassword('');

    } catch (err) {
      console.error('登録エラー:', err);
      alert(`登録に失敗しました: ${err.message}`);
    }
  };

  // === ログインボタンが押された時の処理 ===
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('ユーザー名とパスワードの両方を入力してください。');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(await response.text()); // "認証失敗" など
      }

      const data = await response.json(); // { message: '...', token: '...' }

      // === ★★★ 最も重要な処理 ★★★ ===
      // 取得したトークンをブラウザのLocalStorageに保存する
      localStorage.setItem('token', data.token);
      
      alert('ログインしました！');
      
      // ホーム画面に強制遷移
      navigate('/home'); 

    } catch (err) {
      console.error('ログインエラー:', err);
      alert(`ログインに失敗しました: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>手帖を開く</h2>
      <p style={{ textAlign: 'center', color: '#7a6a5a' }}>
        初めての方は、入力後に「新規登録」を押してください。
      </p>

      {/* ボタンが2つあるため、formのonSubmitは使わず、
        各ボタンのonClickで個別の関数を呼び出します。
      */}
      <form>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            ユーザー名:
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            パスワード:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <button 
            onClick={handleLogin} 
            style={{ flex: 1, fontSize: '1.1em', padding: '12px' }}
          >
            ログイン
          </button>
          <button 
            type="button" // (type="button" でフォーム送信を防ぐ)
            onClick={handleRegister} 
            style={{ flex: 1, fontSize: '1.1em', padding: '12px' }}
          >
            新規登録
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginScreen;