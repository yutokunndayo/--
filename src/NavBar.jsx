import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  // useLocation を使うと、ページ移動のたびにこのコンポーネントが再描画され、
  // ログイン状態の変化（メニューの切り替え）が即座に反映されます。
  useLocation();

  // トークンがあるかチェック
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    // トークンを削除（＝ログアウト）
    localStorage.removeItem('token');
    alert('ログアウトしました');
    // ログイン画面へ戻る
    navigate('/login');
  };

  return (
    <nav>
      <ul>
        {token ? (
          /* === ログインしている時に表示するメニュー === */
          <>
            <li>
              <Link to="/">ホーム (追憶の地図)</Link>
            </li>
            <li>
              <Link to="/post">＋ 聖地マップ作成</Link>
            </li>
            <li>
              {/* リンクと同じデザインに見せるため aタグ を使いつつ、
                  hrefの代わりに onClick でログアウト処理を実行します */}
              <a 
                onClick={handleLogout} 
                style={{ cursor: 'pointer' }}
              >
                ログアウト
              </a>
            </li>
          </>
        ) : (
          /* === ログインしていない時に表示するメニュー === */
          <li>
            <Link to="/login">ログイン / 新規登録</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}