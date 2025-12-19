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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold"><i className="fas fa-user"></i> Профиль</h2>
            <button
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {!editMode ? (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-user text-3xl"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    Имя пользователя
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {username}
                  </p>
                </div>
              </div>
              <Button
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                onClick={() => setEditMode(true)}
                disabled={isLoading}
              >
                <i className="fas fa-edit"></i> Редактировать
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Имя пользователя
                  </label>
                  <input
                    className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all disabled:opacity-50"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Новый пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full h-12 px-4 pr-12 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all disabled:opacity-50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Введите новый пароль"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <i className="fas fa-eye"></i>
                      ) : (
                        <i className="fas fa-eye-slash"></i>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Оставьте пустым, если не хотите менять пароль
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  className="flex-1 h-12 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-semibold transition-all disabled:opacity-50"
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

const Button = ({ children, className = '', ...props }) => (
  <button
    className={`px-4 py-2 rounded-lg transition-all ${className}`}
    {...props}
  >
    {children}
  </button>
);