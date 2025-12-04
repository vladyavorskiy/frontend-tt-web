import React, { useState, useEffect } from 'react';

export default function ProfileModal({ isOpen, onClose, user, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.username || '');
      setPassword('');
      setEditMode(false);
      setError('');
      setShowPassword(false);
      setIsLoading(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Имя не может быть пустым');
      return;
    }

    if (trimmedUsername === user.username && !password.trim()) {
      setEditMode(false);
      setPassword('');
      setShowPassword(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(trimmedUsername, password || null);
      setEditMode(false);
      setPassword('');
      setShowPassword(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка при сохранении');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername(user.username || '');
    setPassword('');
    setEditMode(false);
    setError('');
    setShowPassword(false);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
          disabled={isLoading}
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Профиль</h2>

        {error && (
          <div className="text-red-500 text-sm mb-3 text-center">{error}</div>
        )}

        {!editMode ? (
          <div className="text-center">
            <p className="text-lg font-medium mb-4">
              Имя пользователя: <span className="font-bold">{username}</span>
            </p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              onClick={() => setEditMode(true)}
              disabled={isLoading}
            >
              Редактировать
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block mb-1">Имя пользователя</label>
              <input
                className="border p-2 rounded w-full disabled:bg-gray-100"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Пароль</label>
              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="border p-2 rounded w-full disabled:bg-gray-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="px-2 py-1 border rounded disabled:bg-gray-100"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:bg-gray-300"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Отмена
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}