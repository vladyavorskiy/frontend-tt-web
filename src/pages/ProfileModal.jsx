import React, { useState, useEffect } from 'react';
import { ProfileIcon } from '../components/GameIcons';

export default function ProfileModal({ isOpen, onClose, user, onSave, showToast }) {
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.username || '');
      setPassword('');
      setEditMode(false);
      setError('');
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
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(trimmedUsername, password || null);
      setEditMode(false);
      setPassword('');
      setError('');
      showToast('success', 'Профиль обновлен');
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
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#00277D] px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Профиль</h2>
            <button
              className="w-8 h-8 rounded-md hover:bg-white/20 flex items-center justify-center transition-colors text-white text-xl"
              onClick={onClose}
              disabled={isLoading}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {!editMode ? (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-full flex items-center justify-center mx-auto">
                <ProfileIcon width={40} height={40} color="white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Имя пользователя</p>
                <p className="text-xl font-semibold text-gray-900">{username}</p>
              </div>
              <button
                className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors"
                onClick={() => setEditMode(true)}
                disabled={isLoading}
              >
                Редактировать
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Имя пользователя</label>
                  <input
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Новый пароль</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Оставьте пустым"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Оставьте пустым, если не хотите менять</p>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  className="flex-1 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  className="flex-1 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors"
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
    </div>
  );
}