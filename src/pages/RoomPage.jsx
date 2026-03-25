import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import socket from '../socketClient';

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

  const messagesEndRef = useRef(null);
  const userName = sessionStorage.getItem('userName');
  const userId = Number(sessionStorage.getItem('userId'));
  const sessionId = sessionStorage.getItem('sessionId');

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
    console.log('[RoomPage] start_game_request emitted');
    socket.emit('start_game_request');
  };

  const copyRoomId = () => {
    const textToCopy = roomId;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          showToast('success', `ID комнаты скопирован`);
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
        showToast('success', `ID комнаты скопирован`);
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#1E293B]">Переход к игре...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#1E293B]">Комната</h1>
                <div className="flex items-center gap-1">
                  <code className="font-mono text-xs bg-[#F1F5F9] px-2 py-1 rounded text-[#1E293B]">
                    {roomId}
                  </code>
                  <button
                    className="w-6 h-6 hover:bg-[#F1F5F9] rounded flex items-center justify-center transition-colors"
                    onClick={copyRoomId}
                  >
                    <span className="text-xs text-[#64748B]">📋</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-[#64748B]">{participants.length} участников</span>
                {isCreator && (
                  <span className="px-2 py-0.5 bg-[#3B82F6] text-white text-[10px] rounded">Создатель</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isCreator && !roomClosed && (
                <button
                  onClick={startGame}
                  className="h-8 px-3 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium rounded-md transition-colors"
                >
                  Начать игру
                </button>
              )}
              
              {!roomClosed && !isCreator && (
                <button
                  onClick={leaveRoom}
                  disabled={leaving}
                  className="h-8 px-3 border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#1E293B] text-xs font-medium rounded-md transition-colors"
                >
                  {leaving ? 'Выходим...' : 'Выйти'}
                </button>
              )}
              
              {isCreator && !roomClosed && (
                <button
                  onClick={deleteRoom}
                  className="h-8 px-3 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-medium rounded-md transition-colors"
                >
                  Удалить
                </button>
              )}

              <button
                onClick={() => navigate('/')}
                className="h-8 px-3 border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#1E293B] text-xs font-medium rounded-md transition-colors"
              >
                Главная
              </button>
            </div>
          </div>

          {leaveError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-xs">Ошибка: {leaveError}</p>
            </div>
          )}
        </div>

        {roomClosed ? (
          <div className="text-center py-12">
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-8 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-[#1E293B] mb-2">Комната закрыта</h2>
              <p className="text-xs text-[#64748B] mb-4">Создатель комнаты завершил сессию</p>
              <button
                onClick={() => navigate('/')}
                className="h-8 px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium rounded-md transition-colors"
              >
                Вернуться на главную
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Chat */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm h-[600px] flex flex-col">
                <div className="bg-[#1E293B] px-4 py-2">
                  <h2 className="text-xs font-semibold text-white">Чат</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-[#64748B]">Нет сообщений</p>
                    </div>
                  ) : (
                    messages.map((m, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-[#F1F5F9] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-medium text-[#1E293B]">
                            {(m.from?.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          {m.from?.name === 'Система' ? (
                            <p className="text-[10px] text-[#64748B] italic">{m.text}</p>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-medium text-[#1E293B]">{m.from?.name}</span>
                                <span className="text-[8px] text-[#94A3B8]">
                                  {new Date(m.createdAt).toLocaleTimeString('ru-RU', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-[#1E293B] bg-[#F8FAFC] p-2 rounded">{m.text}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="border-t border-[#E2E8F0] p-3">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      value={msg}
                      onChange={e => setMsg(e.target.value)}
                      placeholder="Напишите сообщение..."
                      className="flex-1 h-8 px-3 bg-white border border-[#CBD5E1] rounded-md text-xs focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                      disabled={roomClosed || leaving}
                    />
                    <button 
                      type="submit"
                      className="w-8 h-8 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-md flex items-center justify-center disabled:opacity-50 transition-colors"
                      disabled={roomClosed || leaving || !msg.trim()}
                    >
                      <span className="text-xs">→</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
                <div className="bg-[#1E293B] px-4 py-2">
                  <h2 className="text-xs font-semibold text-white">Участники</h2>
                </div>
                <div className="p-3 space-y-1 max-h-[540px] overflow-y-auto">
                  {participants.length === 0 ? (
                    <p className="text-xs text-[#64748B] text-center py-4">Нет участников</p>
                  ) : (
                    participants.map(p => {
                      const isCurrentUser = p.userId === userId;
                      const isRoomCreator = p.isCreator;

                      return (
                        <div
                          key={p.sessionId}
                          className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                            isCurrentUser ? 'bg-[#F1F5F9]' : 'hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCurrentUser ? 'bg-[#10B981]' : isRoomCreator ? 'bg-[#3B82F6]' : 'bg-[#94A3B8]'
                            }`}>
                              <span className="text-[8px] font-medium text-white">
                                {(p.name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-[#1E293B]">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {isRoomCreator && (
                              <span className="text-[8px] text-[#3B82F6]">создатель</span>
                            )}
                            {isCurrentUser && (
                              <span className="text-[8px] text-[#10B981]">вы</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}