import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('ログアウトしました');
    navigate('/'); // ログアウト後はトップ（ログイン画面）へ
  };

  return (
    <nav>
      <ul>
        {token ? (
          /* ログイン中 */
          <>
            <li>
              {/* ★変更: ホームボタンは選択画面へ戻るようにする */}
              <Link to="/select">メニュー画面</Link>
            </li>
            <li>
              <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
                ログアウト
              </a>
            </li>
          </>
        ) : (
          /* 未ログイン時 */
          <li>
            <Link to="/">あの景色 - 聖地巡礼Map -</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}