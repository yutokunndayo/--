import React from 'react';
import { useNavigate } from 'react-router-dom';

function TitleScreen() {
  const navigate = useNavigate();

  // ↓↓↓ 関数名を変更 (goToHome → goToLogin)
  const goToLogin = () => {
    // 遷移先を /home から /login に変更
    navigate('/login');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>追憶の地図</h1>
      <h2>- Memoir Map -</h2>
      <p style={{ fontSize: '1.1em', marginTop: '1.5rem', marginBottom: '2rem' }}>
        物語のあの場所を、あなたの足跡で記録しよう。
      </p>
      
      {/* ↓↓↓ 呼び出す関数を変更 */}
      <button onClick={goToLogin}>
        手帖を開く (ログイン / 新規登録)
      </button>
    </div>
  );
}

export default TitleScreen;