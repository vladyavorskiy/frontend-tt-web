import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import socket from '../socketClient';
import GamePage from './GamePage.jsx';

const WS_BASE = import.meta.env.VITE_WS_BASE || 'http://localhost:4000';

export default function RoomPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [roomClosed, setRoomClosed] = useState(false);
  const [isCreator, setIsCreator] = useState(sessionStorage.getItem('isCreator') === 'true');
  const [gameStarted, setGameStarted] = useState(false);

  const messagesEndRef = useRef(null);
  const userName = sessionStorage.getItem('userName');
  const userId = Number(sessionStorage.getItem('userId'));
  const sessionId = sessionStorage.getItem('sessionId');

  useEffect(() => {
    if (!userName || !userId) {
      alert('Сначала войдите в аккаунт на главной странице.');
      navigate('/');
      return;
    }

    if (!socket.connected) socket.connect();

    socket.emit('join_room', { roomId, userId, sessionId });

    const addMessage = (m) => setMessages(prev => [...prev, m]);

    // const onConnect = () => {
    //   socket.emit('join_room', { roomId, userId, sessionId });
    // };

    const onJoined = (data) => {
      console.log('[RoomPage] joined', data);
      const creatorFlag = !!data.isCreator;
      setIsCreator(creatorFlag);
      sessionStorage.setItem('isCreator', creatorFlag ? 'true' : 'false');
      setParticipants(data.participants || []);
      sessionStorage.setItem('activeRoom', roomId);
    };

    const onUpdateParticipants = (data) => {
      setParticipants(data.participants || []);
    };

    const onLeftRoomSuccess = () => {
      sessionStorage.removeItem('activeRoom');
      navigate('/');
    };

    const onChatHistory = (msgs) => {
      const mapped = (msgs || []).map(m => ({
        from: { name: m.sender_name, id: m.user_id },
        text: m.message,
        createdAt: m.created_at || new Date().toISOString()
      }));
      setMessages(mapped);
    };

    const onReceiveMessage = (data) => {
      addMessage({
        from: data.from || { name: 'Неизвестно' },
        text: data.text,
        createdAt: new Date().toISOString()
      });
    };

    const onRoomClosed = () => {
      setRoomClosed(true);
      addMessage({ from: { name: 'Система' }, text: 'Комната закрыта создателем', createdAt: new Date().toISOString() });
      sessionStorage.removeItem('activeRoom');
    };

    const onGameStarted = () => {
      console.log('[RoomPage] game_started received — navigating to game for room', roomId);
      setGameStarted(true);
    };

    // socket.on('connect', onConnect);
    socket.on('joined', onJoined);
    socket.on('update_participants', onUpdateParticipants);
    socket.on('left_room_success', onLeftRoomSuccess);
    socket.on('chat_history', onChatHistory);
    socket.on('receive_message', onReceiveMessage);
    socket.on('room_closed', onRoomClosed);
    socket.on('game_started', onGameStarted);

    return () => {
      // socket.off('connect', onConnect);
      socket.off('joined', onJoined);
      socket.off('update_participants', onUpdateParticipants);
      socket.off('left_room_success', onLeftRoomSuccess);
      socket.off('chat_history', onChatHistory);
      socket.off('receive_message', onReceiveMessage);
      socket.off('room_closed', onRoomClosed);
      socket.off('game_started', onGameStarted);
    };
  }, [roomId, navigate, userId, userName, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msg.trim() || roomClosed || !socket) return;
    socket.emit('send_message', msg);
    setMsg('');
  };

  const leaveRoom = () => {
    if (!socket) return;
    if (!window.confirm('Вы хотите выйти из комнаты?')) return;
    socket.emit('leave_room_request');
  };

  const deleteRoom = () => {
    if (!socket) return;
    if (!window.confirm('Вы точно хотите удалить комнату?')) return;
    socket.emit('delete_room');
  };

  const startGame = () => {
    if (!socket || !isCreator) return;
    socket.emit('start_game_request');
    console.log("start game (emitted start_game_request) — waiting server events to navigate");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {!gameStarted ? (
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">
              Комната: <span className="text-blue-600 cursor-pointer underline"
                title="Кликните, чтобы скопировать"
                onClick={() => { navigator.clipboard.writeText(roomId); alert(`ID комнаты ${roomId} скопирован`) }}
              >{roomId}</span>
            </h2>
            <p className="text-sm text-gray-500">Участников: {participants.length}</p>
          </div>
          <div className="flex gap-2">
            {isCreator && !roomClosed && <>
              <button onClick={deleteRoom} className="px-3 py-2 bg-red-600 text-white rounded">Удалить комнату</button>
              <button onClick={startGame} className="px-3 py-2 bg-green-600 text-white rounded">Создать игру</button>
            </>}
            {!isCreator && !roomClosed && <button onClick={leaveRoom} className="px-3 py-2 bg-yellow-500 text-black rounded">Выйти из комнаты</button>}
            <Link to="/" className="px-3 py-2 border rounded">Главная</Link>
          </div>
        </div>

        {roomClosed ? (
          <div className="text-red-600 text-lg">Комната закрыта создателем.</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="border rounded p-3 h-96 overflow-auto bg-gray-50">
                {messages.map((m, i) => (
                  <div key={i} className="mb-2">
                    {m.from?.name === 'Система'
                      ? <div className="text-sm text-gray-500 italic">{m.text}</div>
                      : <div><b>{m.from?.name}:</b> {m.text}</div>}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="mt-3 flex gap-2">
                <input value={msg} onChange={e => setMsg(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Сообщение..." disabled={roomClosed}/>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={roomClosed}>Отправить</button>
              </form>
            </div>

            <div className="col-span-1">
              <div className="border rounded p-3 bg-white">
                <h3 className="font-semibold mb-2">Участники</h3>
                <ul className="space-y-2">
                  {participants.map(p => {
                    const isCurrentUser = p.userId === userId;
                    const isRoomCreator = p.userId === (participants.find(x => x.isCreator)?.userId || data?.creatorUserId);

                    return (
                      <li key={p.sessionId} className={`p-2 border rounded ${isCurrentUser ? 'bg-blue-100 font-semibold' : 'bg-white'}`}>
                        {p.name}
                        {isCurrentUser && <span className="text-blue-600"> (Вы)</span>}
                        {isRoomCreator && <span className="text-green-600"> (Создатель)</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
       ) : (
        <GamePage socket={socket} userId={userId} isCreator={isCreator} />
       )}
    </div>
  );
}




