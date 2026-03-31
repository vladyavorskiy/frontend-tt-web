import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import socket from '../socketClient';
import Header from './Header';
import ProfileModal from './ProfileModal';
import GameSelectionModal from './GameSelectionModal';
import { 
  CopyIcon, 
  CheckCopyIcon, 
  UsersIcon, 
  PlayIcon, 
  HomeIcon, 
  LogoutIcon, 
  DeleteIcon, 
  SendIcon 
} from '../components/GameIcons';

export default function RoomPage({ showToast }) {
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [roomClosed, setRoomClosed] = useState(false);
  const [isCreator, setIsCreator] = useState(sessionStorage.getItem('isCreator') === 'true');
  const [gameStarted, setGameStarted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState({ 
    username: sessionStorage.getItem('userName') || '', 
    id: Number(sessionStorage.getItem('userId')),
    email: ''
  });

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const participantsContainerRef = useRef(null);
  const userName = sessionStorage.getItem('userName');
  const userId = Number(sessionStorage.getItem('userId'));
  const sessionId = sessionStorage.getItem('sessionId');

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти из аккаунта?')) {
      Cookies.remove('token');
      sessionStorage.clear();
      navigate('/');
      showToast('success', 'Вы вышли из аккаунта');
    }
  };

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const updateProfile = async (newUsername, newPassword) => {
    try {
      const usernameStr = (newUsername || "").trim();
      const passwordStr = (newPassword || "").trim();
      if (!usernameStr) {
        showToast('error', "Имя не может быть пустым");
        return;
      }

      const token = Cookies.get("token");
      if (!token) {
        showToast('error', "Вы не авторизованы");
        return;
      }

      const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";
      const res = await fetch(`${API}/api/user/update_profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: usernameStr, password: passwordStr || null }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка обновления профиля");

      setUser(data.user);
      sessionStorage.setItem("userName", data.user.username);
      sessionStorage.setItem("userId", data.user.id);
      showToast('success', "Профиль успешно обновлен");
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    console.log('[RoomPage] mount, roomId =', roomId);

    if (!userName || !userId) {
      showToast('success', 'Сначала войдите в аккаунт на главной странице.');
      navigate('/');
      return;
    }

    if (!socket.connected) {
      console.log('[RoomPage] connecting socket...');
      socket.connect();
    }

    console.log('[RoomPage] join_room →', { roomId, userId, sessionId });
    socket.emit('join_room', { roomId, userId, sessionId });

    const addMessage = (m) => setMessages(prev => [...prev, m]);

    const handlers = {
      joined: (data) => {
        console.log('[RoomPage] joined:', data);
        setIsCreator(!!data.isCreator);
        sessionStorage.setItem('isCreator', data.isCreator ? 'true' : 'false');
        setParticipants(data.participants || []);
        sessionStorage.setItem('activeRoom', roomId);
        setLeaving(false);
        setLeaveError(null);
      },

      update_participants: (data) => {
        console.log('[RoomPage] participants updated:', data.participants);
        setParticipants(data.participants || []);
      },

      left_room_success: (data) => {
        console.log('[RoomPage] left_room_success', data);
        sessionStorage.removeItem('activeRoom');
        setLeaving(false);
        setLeaveError(null);
        showToast('success', `${data.userName || 'Вы'} успешно покинули комнату`);
        navigate('/');
      },

      leave_error: (error) => {
        console.error('[RoomPage] leave_error:', error);
        setLeaving(false);
        setLeaveError(error.message || 'Неизвестная ошибка');
        showToast('error', `Ошибка при выходе из комнаты: ${error.message}`);
      },

      chat_history: (msgs) => {
        console.log('[RoomPage] chat_history loaded:', msgs.length);
        const mapped = (msgs || []).map(m => ({
          from: { name: m.sender_name, id: m.user_id },
          text: m.message,
          createdAt: m.created_at || new Date().toISOString()
        }));
        setMessages(mapped);
      },

      receive_message: (data) => {
        console.log('[RoomPage] receive_message:', data);
        addMessage({
          from: data.from || { name: 'Неизвестно' },
          text: data.text,
          createdAt: new Date().toISOString()
        });
      },

      room_closed: () => {
        console.warn('[RoomPage] room_closed');
        setRoomClosed(true);
        addMessage({
          from: { name: 'Система' },
          text: 'Комната закрыта создателем',
          createdAt: new Date().toISOString()
        });
        sessionStorage.removeItem('activeRoom');
        setTimeout(() => {
          showToast('default', 'Комната была закрыта создателем');
          navigate('/');
        }, 1000);
      },

      game_started: () => {
        console.log('[RoomPage] game_started → navigating to game');
        setGameStarted(true);
        navigate(`/room/${roomId}/game`, { state: { userId, isCreator } });
      },

      player_ready: (data) => console.log('[RoomPage] player_ready:', data),
      update_score: (data) => console.log('[RoomPage] update_score:', data),
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      console.log('[RoomPage] unmount — removing listeners');
      Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
    };

  }, [roomId, navigate, userId, userName, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msg.trim() || roomClosed || !socket) return;
    console.log('[RoomPage] send_message:', msg);
    socket.emit('send_message', { text: msg, roomId, userId, sessionId });
    setMsg('');
  };

  const leaveRoom = () => {
    if (!socket || leaving) return;
    if (!window.confirm('Вы уверены, что хотите выйти из комнаты?')) return;

    console.log('[RoomPage] leave_room_request emitted');
    setLeaving(true);
    setLeaveError(null);

    const timeout = setTimeout(() => {
      console.warn('[RoomPage] leave timeout expired');
      setLeaving(false);
      showToast('error', 'Не удалось выйти из комнаты. Проверьте соединение или перезагрузите страницу.');
    }, 10000);

    socket.once('left_room_success', () => clearTimeout(timeout));
    socket.once('leave_error', () => clearTimeout(timeout));

    socket.emit('leave_room_request');
  };

  const deleteRoom = () => {
    if (!socket) return;
    if (!window.confirm('Вы точно хотите удалить комнату? Все участники будут выгнаны.')) return;
    console.warn('[RoomPage] delete_room emitted');
    socket.emit('delete_room');
  };

  const startGame = () => {
    if (!socket || !isCreator) return;
    setShowSettings(true);
  };

  const handleGameStart = () => {
    setShowSettings(false);
    socket.emit('start_game_request');
  };

  const copyRoomId = () => {
    const textToCopy = roomId;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopied(true);
          showToast('success', `ID комнаты скопирован`);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch(err => {
          console.warn('Clipboard API error:', err);
          fallbackCopy(textToCopy);
        });
    } else {
      fallbackCopy(textToCopy);
    }
  };
  
  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        showToast('success', `ID комнаты скопирован`);
        setTimeout(() => setCopied(false), 1500);
      } else {
        showToast('error', 'Не удалось скопировать ID комнаты');
      }
    } catch (err) {
      console.error('Fallback copy error:', err);
      showToast('error', 'Ошибка при копировании ID комнаты');
    }
    
    document.body.removeChild(textArea);
  };

  if (gameStarted) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-900">Переход к игре...</p>
        </div>
      </div>
    );
  }

  const creator = participants.find(p => p.isCreator);
  const creatorName = creator?.name || 'Создатель';

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <Header 
        user={user} 
        onProfileClick={handleProfileClick} 
        onLogout={handleLogout} 
        isInGame={false}
      />
      
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex flex-wrap justify-between items-center gap-3 px-6 xl:px-[122px] py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black">Комната:</span>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 bg-gray-100 rounded text-[15px] font-semibold text-black leading-6">
                  {roomId}
                </span>
                <button
                  onClick={copyRoomId}
                  title={copied ? "Скопировано!" : "Копировать код"}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {copied ? (
                    <CheckCopyIcon width={16} height={16} color="#16A34A" />
                  ) : (
                    <CopyIcon width={16} height={16} color="#374151" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 px-3 py-1 rounded-md border border-gray-200">
              <UsersIcon width={16} height={16} color="#374151" />
              <span className="text-sm text-black">{participants.length} участников</span>
            </div>

            <div className="flex items-center px-3 py-1 rounded-md bg-gray-100">
              <span className="text-sm text-black">Создатель:</span>
              <span className="text-sm text-black px-1 font-medium">{creatorName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-[5px]">
            {isCreator && !roomClosed && (
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#16A34A] text-white text-base font-medium hover:bg-[#15803D] transition-colors"
              >
                <PlayIcon width={17} height={17} color="white" />
                Начать игру
              </button>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2 rounded-md border border-gray-300 bg-white text-black text-base font-medium hover:bg-gray-50 transition-colors"
            >
              <HomeIcon width={20} height={20} color="black" />
              Главная
            </button>

            {!roomClosed && !isCreator && (
              <button
                onClick={leaveRoom}
                disabled={leaving}
                className="flex items-center gap-2 px-5 py-2 rounded-md border border-gray-300 bg-white text-black text-base font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <LogoutIcon width={20} height={20} color="black" />
                {leaving ? 'Выходим...' : 'Выйти'}
              </button>
            )}

            {isCreator && !roomClosed && (
              <button
                onClick={deleteRoom}
                className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#DC2626] text-white text-base font-medium hover:bg-[#B91C1C] transition-colors"
              >
                <DeleteIcon width={20} height={20} color="white" />
                Удалить
              </button>
            )}
          </div>
        </div>
      </div>

      {leaveError && (
        <div className="max-w-7xl mx-auto px-6 xl:px-[122px] mt-4 flex-shrink-0">
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">Ошибка: {leaveError}</p>
          </div>
        </div>
      )}

      {roomClosed ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Комната закрыта</h2>
            <p className="text-sm text-gray-600 mb-4">Создатель комнаты завершил сессию</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-[18px] p-6 xl:px-[122px] min-h-0 overflow-hidden">
          <div className="flex-1 bg-white rounded-lg shadow-lg flex flex-col min-h-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-semibold text-black leading-7">Чат</h2>
            </div>
            
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3"
            >
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-500">Нет сообщений</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <ChatMessage key={i} message={m} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="px-6 pb-5 pt-3 flex-shrink-0">
              <form onSubmit={sendMessage} className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
                <input
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1 px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
                  disabled={roomClosed || leaving}
                />
                <button
                  type="submit"
                  disabled={roomClosed || leaving || !msg.trim()}
                  className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-blue-600 rounded-lg mr-[2px] hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <SendIcon width={18} height={18} color="white" />
                </button>
              </form>
            </div>
          </div>

          <div className="w-[280px] bg-white rounded-lg shadow-lg flex flex-col flex-shrink-0 min-h-0 overflow-hidden">
            <div className="px-5 py-5 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-semibold text-black leading-7">Участники</h2>
            </div>
            <div 
              ref={participantsContainerRef}
              className="flex-1 overflow-y-auto px-5 py-3"
            >
              <div className="flex flex-col gap-3">
                {participants.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Нет участников</p>
                ) : (
                  participants.map(p => {
                    const isCurrentUser = p.userId === userId;
                    const isRoomCreator = p.isCreator;

                    return (
                      <ParticipantItem
                        key={p.sessionId}
                        name={p.name}
                        letter={(p.name || 'U').charAt(0).toUpperCase()}
                        isCreator={isRoomCreator}
                        isYou={isCurrentUser}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <GameSelectionModal
          onClose={() => setShowSettings(false)}
          onSelectGame={handleGameStart}
          showToast={showToast}
        />
      )}

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onSave={updateProfile}
        showToast={showToast}
      />
    </div>
  );
}

function ChatMessage({ message }) {
  const isSystem = message.from?.name === 'Система';
  const name = message.from?.name || 'Неизвестно';
  const letter = name.charAt(0).toUpperCase();
  const time = new Date(message.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  if (isSystem) {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-400">
          <span className="text-white text-sm font-semibold">С</span>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className="text-sm text-gray-500 italic">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500">
        <span className="text-white text-sm font-semibold">{letter}</span>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-black">{name}</span>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-black leading-5 break-words">{message.text}</p>
      </div>
    </div>
  );
}

function ParticipantItem({ name, letter, isCreator, isYou }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500">
        <span className="text-white text-sm font-semibold">{letter}</span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-black truncate">{name}</span>
        {(isCreator || isYou) && (
          <span className="text-xs text-gray-500">
            {isCreator && isYou ? 'Создатель, Вы' : isCreator ? 'Создатель' : 'Вы'}
          </span>
        )}
      </div>
    </div>
  );
}