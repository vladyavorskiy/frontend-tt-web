import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import socket from '../socketClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CopyIcon, SendIcon, AlertCircle, Users, MessageSquare } from "lucide-react";

export default function RoomPage({showToast}) {
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
          showToast('Комната была закрыта создателем'); 
          navigate('default',); 
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

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages]);

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
    navigator.clipboard.writeText(roomId);
    showToast('success', `ID комнаты ${roomId} скопирован`);
  };

  if (gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="animate-spin">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Переход к игре...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  Комната: {roomId}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
                    onClick={copyRoomId}
                  >
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{participants.length} участников</span>
                  </div>
                  {isCreator && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      Создатель
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isCreator && !roomClosed && (
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Начать игру
                </Button>
              )}
              
              {!roomClosed && !isCreator && (
                <Button
                  onClick={leaveRoom}
                  variant="outline"
                  disabled={leaving}
                  className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-xl font-semibold"
                >
                  {leaving ? 'Выходим...' : 'Выйти'}
                </Button>
              )}
              
              {isCreator && !roomClosed && (
                <Button
                  onClick={deleteRoom}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-bold"
                >
                  Удалить комнату
                </Button>
              )}

              <Link to="/">
                <Button
                  variant="outline"
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 rounded-xl border-gray-300 dark:border-gray-600"
                >
                  Главная
                </Button>
              </Link>
            </div>
          </div>

          {leaveError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>Ошибка: {leaveError}</span>
              </div>
            </div>
          )}
        </div>

        {roomClosed ? (
          <div className="text-center py-12">
            <div className="inline-block p-8 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800">
              <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
                Комната закрыта
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Создатель комнаты завершил сессию
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl"
              >
                Вернуться на главную
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Чат */}
            <div className="lg:col-span-2">
              <Card className="h-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6" />
                    <CardTitle className="text-2xl font-bold">Чат комнаты</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] p-6">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Начните общение! Напишите первое сообщение.
                          </p>
                        </div>
                      ) : (
                        messages.map((m, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-700">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {(m.from?.name || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              {m.from?.name === 'Система' ? (
                                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                  {m.text}
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-800 dark:text-white">
                                      {m.from?.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(m.createdAt).toLocaleTimeString('ru-RU', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                                    {m.text}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <Input
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        placeholder="Напишите сообщение..."
                        className="flex-1 h-12 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400"
                        disabled={roomClosed || leaving}
                      />
                      <Button 
                        type="submit"
                        size="icon"
                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600"
                        disabled={roomClosed || leaving || !msg.trim()}
                      >
                        <SendIcon className="w-5 h-5" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="h-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6" />
                    <CardTitle className="text-2xl font-bold">Участники</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {participants.map(p => {
                      const isCurrentUser = p.userId === userId;
                      const isRoomCreator = p.isCreator;

                      return (
                        <div
                          key={p.sessionId}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                            isCurrentUser 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700'
                              : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className={
                                isCurrentUser ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : 
                                isRoomCreator ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : 
                                "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                              }>
                                {(p.name || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white">
                                {p.name}
                              </p>
                              {isRoomCreator && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  Создатель комнаты
                                </p>
                              )}
                            </div>
                          </div>

                          {isCurrentUser && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                              Вы
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                    
                    {participants.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Нет участников
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}