import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import socket from '../socketClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CopyIcon, SendIcon, AlertCircle } from "lucide-react";

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
    return <p className="text-center mt-6">Переход к игре...</p>;
  }

  return (
    <main className="flex flex-col w-full items-start bg-gray-100 min-h-screen">
      <div className="flex flex-col items-start pt-4 px-4 md:px-80 w-full">
        <div className="flex flex-col max-w-screen-xl items-start w-full mx-auto">
          
          <header className="flex flex-wrap items-center justify-between gap-4 pt-0 pb-4 px-0 w-full bg-transparent border-b border-gray-200">
            <div className="inline-flex items-center gap-4">
              <div className="inline-flex flex-col items-start">
                <h1 className="flex items-center justify-center w-fit font-semibold text-xl text-gray-900">
                  TableTime
                </h1>
              </div>
            </div>

            <div className="inline-flex flex-wrap items-center gap-2">
              {isCreator && !roomClosed && (
                <Button 
                  onClick={startGame}
                  className="min-w-[84px] h-10 px-4 py-0 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  Начать игру
                </Button>
              )}
              
              {!roomClosed && !isCreator && (
                <Button 
                  onClick={leaveRoom}
                  variant="outline"
                  disabled={leaving}
                  className="min-w-[84px] h-10 px-4 py-0 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {leaving ? 'Выходим...' : 'Выйти'}
                </Button>
              )}
              
              {isCreator && !roomClosed && (
                <Button 
                  onClick={deleteRoom}
                  className="min-w-[84px] h-10 px-4 py-0 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  Удалить комнату
                </Button>
              )}

              <Link to="/">
                <Button
                  variant="outline"
                  className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl border-gray-300 font-bold text-sm transition-colors"
                >
                  Главная
                </Button>
              </Link>
            </div>
          </header>

          {leaveError && (
            <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Ошибка: {leaveError}</span>
              </div>
            </div>
          )}

          <section className="pt-6 pb-0 px-0 flex flex-col items-start w-full">
            <div className="flex flex-col items-start gap-1 w-full">
              <div className="flex items-center gap-2 w-full">
                <h1 className="font-bold text-2xl text-gray-900">
                  Комната: {roomId}
                </h1>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-auto w-auto p-0.5 hover:bg-transparent transition-opacity"
                  aria-label="Copy room code"
                  onClick={copyRoomId}
                >
                  <CopyIcon className="w-4 h-4 text-gray-900" />
                </Button>
              </div>

              <div className="flex flex-col items-start w-full">
                <p className="text-gray-600 text-base">
                  Участники: {participants.length} {leaving && '(выходим...)'}
                </p>
              </div>
            </div>
          </section>

          {roomClosed ? (
            <div className="w-full text-center py-8">
              <div className="text-red-600 text-lg font-semibold">Комната закрыта создателем.</div>
              <Button 
                onClick={() => navigate('/')}
                className="mt-4"
              >
                Вернуться на главную
              </Button>
            </div>
          ) : (
            <section className="flex flex-col items-start pt-6 pb-0 px-0 w-full">
              <div className="flex flex-col lg:flex-row items-start justify-center gap-8 w-full">
                
                <Card className="flex-1 max-w-full lg:max-w-[842.66px] bg-white rounded-2xl border border-gray-200">
                  <CardHeader className="pt-4 pb-4 px-6 border-b border-gray-200">
                    <CardTitle className="font-semibold text-lg text-gray-900">
                      Чат
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-0">
                    <ScrollArea className="h-[360px] p-6">
                      <div className="flex flex-col gap-4">
                        {messages.map((m, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-100 text-blue-800">
                                {(m.from?.name || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              {m.from?.name === 'Система' ? (
                                <div className="text-sm text-gray-500 italic">{m.text}</div>
                              ) : (
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{m.from?.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(m.createdAt).toLocaleTimeString('ru-RU', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 mt-1">{m.text}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="flex flex-col items-start pt-4 pb-4 px-4 border-t border-gray-200">
                      <form onSubmit={sendMessage} className="flex items-center justify-center w-full relative">
                        <Input
                          value={msg}
                          onChange={e => setMsg(e.target.value)}
                          placeholder="Сообщение..."
                          className="h-12 pl-4 pr-12 py-3.5 bg-gray-50 rounded-xl border border-gray-300"
                          disabled={roomClosed || leaving}
                        />
                        <button 
                          type="submit"
                          className="flex w-8 h-8 absolute top-2 right-2 rounded-md items-center justify-center hover:bg-gray-100 transition-colors"
                          disabled={roomClosed || leaving || !msg.trim()}
                        >
                          <SendIcon className="w-4 h-4 text-gray-900" />
                        </button>
                      </form>
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full lg:w-[405.34px] bg-white rounded-2xl border border-gray-200">
                  <CardHeader className="pt-4 pb-4 px-6 border-b border-gray-200">
                    <CardTitle className="font-semibold text-lg text-gray-900">
                      Участники
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      {participants.map(p => {
                        const isCurrentUser = p.userId === userId;
                        const isRoomCreator = p.isCreator;

                        return (
                          <div
                            key={p.sessionId}
                            className={`flex items-center justify-between p-3 rounded-xl ${
                              isRoomCreator ? "bg-blue-50" : ""
                            } ${isCurrentUser ? "border-2 border-green-300" : ""}`}
                          >
                            <div className="inline-flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className={
                                  isCurrentUser ? "bg-green-100 text-green-800" : 
                                  isRoomCreator ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                                }>
                                  {(p.name || 'U').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-gray-900">
                                {p.name}
                              </span>
                            </div>

                            <div className="flex gap-1">
                              {isCurrentUser && (
                                <Badge className="bg-green-100 text-green-800 px-2 py-1 text-xs">
                                  Вы
                                </Badge>
                              )}
                              {isRoomCreator && (
                                <Badge className="bg-blue-100 text-blue-800 px-2 py-1 text-xs">
                                  Создатель
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {participants.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          Нет участников
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}