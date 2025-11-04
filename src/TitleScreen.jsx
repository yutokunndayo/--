import React from 'react';
import { useNavigate } from 'react-router-dom';

function TitleScreen() {
  const navigate = useNavigate();

  const goToHome = () => {
    // 実際にはここでログイン処理などを行う
    console.log('ログイン/新規登録処理（のダミー）');
    navigate('/home');
  };

  return (
    <div style={{ textAlign: 'center' }}> {/* タイトル画面だけ中央揃えに */}
      <h1>追憶の地図</h1>
      <h2>- Memoir Map -</h2>
      <p style={{ fontSize: '1.1em', marginTop: '1.5rem', marginBottom: '2rem' }}>
        物語のあの場所を、あなたの足跡で記録しよう。
      </p>
      <button onClick={goToHome}>
        手帖を開く (ログイン / 新規登録)
      </button>
    </div>
  );
}

export default TitleScreen;