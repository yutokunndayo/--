import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginScreen() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/register' : '/login';
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        if (isRegister) { alert('登録しました！'); setIsRegister(false); }
        else {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          alert('ログイン成功！');
          navigate('/select'); // ★選択画面へ
        }
      } else alert('失敗しました');
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '50px auto', textAlign:'center' }}>
      <h2>{isRegister ? '新規登録' : 'ログイン'}</h2>
      <form onSubmit={handleAuth}>
        <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="ユーザー名" style={{width:'100%', marginBottom:'10px'}} />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="パスワード" style={{width:'100%', marginBottom:'10px'}} />
        <button type="submit" style={{width:'100%', padding:'10px'}}>{isRegister ? '登録' : 'ログイン'}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)} style={{marginTop:'10px', background:'none', border:'none', color:'blue', cursor:'pointer'}}>
        {isRegister ? 'ログインへ戻る' : '新規登録はこちら'}
      </button>
    </div>
  );
}
export default LoginScreen;