import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginScreen() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false); // 登録モードかどうか
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/register' : '/login';
    
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        if (isRegister) {
          alert('登録しました！ログインしてください。');
          setIsRegister(false);
        } else {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          alert('ログイン成功！');
          // ★変更: ログイン後は選択画面へ移動
          navigate('/select');
        }
      } else {
        alert('失敗しました');
      }
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2>{isRegister ? '新規登録' : 'ログイン'}</h2>
      <form onSubmit={handleAuth}>
        <div style={{ marginBottom: '15px' }}>
          <label>ユーザー名:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>パスワード:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#8c7853', color: '#fff', border: 'none', borderRadius: '4px' }}>
          {isRegister ? '登録する' : 'ログインする'}
        </button>
      </form>
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: '#8c7853', textDecoration: 'underline', cursor: 'pointer' }}>
          {isRegister ? 'ログインはこちら' : '新規登録はこちら'}
        </button>
      </div>
    </div>
  );
}

export default LoginScreen;