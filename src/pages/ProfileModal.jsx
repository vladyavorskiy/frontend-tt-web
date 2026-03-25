import React, { useState, useEffect } from 'react';

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
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50 p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-[#1E293B] px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Профиль</h2>
            <button
              className="w-6 h-6 bg-[#2D3A4F] hover:bg-[#3B4A63] rounded-md flex items-center justify-center transition-colors"
              onClick={onClose}
              disabled={isLoading}
            >
              <span className="text-white text-xs">✕</span>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-xs text-center">{error}</p>
            </div>
          )}

          {!editMode ? (
            <div className="text-center space-y-4">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl text-[#1E293B]">👤</span>
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Имя пользователя</p>
                  <p className="text-base font-semibold text-[#1E293B]">{username}</p>
                </div>
              </div>
              <button
                className="w-full h-9 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium rounded-md transition-colors"
                onClick={() => setEditMode(true)}
                disabled={isLoading}
              >
                Редактировать
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#1E293B]">Имя пользователя</label>
                  <input
                    className="w-full h-9 px-3 bg-white border border-[#CBD5E1] rounded-md text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#1E293B]">Новый пароль</label>
                  <input
                    type="password"
                    className="w-full h-9 px-3 bg-white border border-[#CBD5E1] rounded-md text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Оставьте пустым"
                    disabled={isLoading}
                  />
                  <p className="text-[10px] text-[#64748B] mt-1">Оставьте пустым, если не хотите менять</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  className="flex-1 h-9 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  className="flex-1 h-9 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#1E293B] text-xs font-medium rounded-md transition-colors"
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