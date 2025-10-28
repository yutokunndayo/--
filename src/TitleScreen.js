import React from 'react';
import { useNavigate } from 'react-router-dom';

function TitleScreen() {
  const navigate = useNavigate();

  const goToHome = () => {
    // 実際にはここでログイン処理などを行う
    console.log('ログイン/新規登録処理（のダミー）');
    // 処理が終わったらホーム画面に遷移
    navigate('/home');
  };

  return (
    <div>
      <h1>旅行の思い出計画共有アプリ</h1>
      <p>あなたの旅の記録を、次の誰かの計画に。</p>
      <button onClick={goToHome}>
        ログイン / 新規登録 (ホームへ)
      </button>
    </div>
  );
}

export default TitleScreen;