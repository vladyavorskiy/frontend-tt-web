import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import ProfileModal from './ProfileModal';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function ensureSessionId() {
  if (!sessionStorage.getItem('sessionId')) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionStorage.setItem('sessionId', crypto.randomUUID());
    } else {
      sessionStorage.setItem(
        'sessionId',
        `${Date.now()}-${Math.floor(Math.random() * 100000)}`
      );
    }
  }
}

export default function HomePage() {
  ensureSessionId();
  const navigate = useNavigate();

  const [name, setName] = useState(sessionStorage.getItem('userName') || '');
  const [roomId, setRoomId] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState({ username: '', id: null });
  const [error, setError] = useState('');
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authData, setAuthData] = useState({ username: '', password: '' });

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) fetchProfile(token);
    else setIsAuthChecked(true);
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch(`${API}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Ошибка загрузки профиля');
      const data = await res.json();
      setUser(data);
      setName(data.username);
      sessionStorage.setItem('userName', data.username);
      sessionStorage.setItem('userId', data.id);
      setIsAuthChecked(true);
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка регистрации');

      Cookies.set('token', data.token, { expires: 7 });
      sessionStorage.setItem('userName', data.user.username);
      sessionStorage.setItem('userId', data.user.id);
      setUser(data.user);
      setName(data.user.username);
      setIsAuthChecked(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка авторизации');

      Cookies.set('token', data.token, { expires: 7 });
      sessionStorage.setItem('userName', data.user.username);
      sessionStorage.setItem('userId', data.user.id);
      setUser(data.user);
      setName(data.user.username);
      setIsAuthChecked(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('activeRoom');
    setUser({ username: '', id: null });
    setIsAuthChecked(true);
    setIsRegisterMode(false);
  };

  const saveNameToSession = () => {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      alert('Введите имя!');
      return false;
    }
    sessionStorage.setItem('userName', trimmed);
    return true;
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!saveNameToSession()) return;
    const creatorUserId = sessionStorage.getItem('userId');
    const sessionId = sessionStorage.getItem('sessionId');

    if (!creatorUserId) {
      alert('Вы не авторизованы');
      return;
    }

    try {
      const res = await fetch(`${API}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorUserId, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при создании комнаты');

      sessionStorage.setItem('activeRoom', data.id);
      navigate(`/room/${data.id}`);
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  const joinById = (e) => {
    e.preventDefault();
    if (!saveNameToSession()) return;
    if (!roomId.trim()) return alert('Введите ID комнаты');

    sessionStorage.setItem('activeRoom', roomId.trim());
    navigate(`/room/${roomId.trim()}`);
  };

  const goToActiveRoom = () => {
    const activeRoom = sessionStorage.getItem('activeRoom');
    if (activeRoom) navigate(`/room/${activeRoom}`);
  };


  const updateProfile = async (newUsername, newPassword) => {
  try {
    const usernameStr = (newUsername || '').trim();
    const passwordStr = (newPassword || '').trim();
    if (!usernameStr) {
      setError('Имя не может быть пустым');
      return;
    }

    const token = Cookies.get('token');
    if (!token) {
      setError('Вы не авторизованы');
      return;
    }

    const res = await fetch(`${API}/api/user/update_profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: usernameStr, password: passwordStr || null }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Ошибка обновления профиля');

    setUser(data.user);
    setName(data.user.username);
    sessionStorage.setItem('userName', data.user.username);
    sessionStorage.setItem('userId', data.user.id);
    alert('Профиль успешно обновлен');
  } catch (err) {
    throw err;
  }
};



  if (!Cookies.get('token') && isAuthChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
  <div className="w-full max-w-md p-8 bg-white rounded shadow">
    <h1 className="text-xl font-bold mb-4">
      {isRegisterMode ? 'Регистрация' : 'Вход'}
    </h1>

    <input
      type="text"
      placeholder="Имя пользователя"
      value={authData.username}
      onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
      className="w-full p-2 border rounded mb-4"
    />
    <input
      type="password"
      placeholder="Пароль"
      value={authData.password}
      onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
      className="w-full p-2 border rounded mb-4"
    />

    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

    <button
      onClick={isRegisterMode ? handleRegister : handleLogin}
      className="w-full py-2 bg-blue-600 text-white rounded mb-2"
    >
      {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
    </button>

    <p className="text-center text-sm">
      {isRegisterMode ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
      <button
        onClick={() => setIsRegisterMode(!isRegisterMode)}
        className="text-blue-600 underline"
      >
        {isRegisterMode ? 'Войти' : 'Зарегистрироваться'}
      </button>
    </p>
  </div>
</div>

    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Виртуальные комнаты</h1>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="text-sm text-blue-600 underline"
          >
            Профиль
          </button>
        </div>

        {sessionStorage.getItem('activeRoom') && (
          <div className="mb-4">
            <button
              onClick={goToActiveRoom}
              className="w-full py-2 bg-purple-600 text-white rounded"
            >
              Перейти в активную комнату
            </button>
          </div>
        )}

        <form onSubmit={createRoom} className="mb-4">
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded"
          >
            Создать комнату
          </button>
        </form>

        <div className="mt-6 border-t pt-6">
          <h2 className="font-semibold mb-2">Присоединиться по ID комнаты</h2>
          <form onSubmit={joinById} className="flex gap-2">
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="ID комнаты"
              className="flex-1 p-2 border rounded"
            />
            <button className="px-4 py-2 bg-green-600 text-white rounded">
              Присоединиться
            </button>
          </form>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full py-2 bg-red-600 text-white rounded"
        >
          Выйти из профиля
        </button>
      </div>

      {isProfileOpen && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onSave={updateProfile}
        />
      )}
    </div>
  );
}
