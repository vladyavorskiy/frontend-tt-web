import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const WS_BASE = import.meta.env.VITE_WS_BASE || 'http://localhost:4000';

export default function RoomPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  const [participantsMap, setParticipantsMap] = useState(new Map());
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [roomClosed, setRoomClosed] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

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

    const s = io(WS_BASE, { autoConnect: false });
    s.connect();
    setSocket(s);

    const addMessage = (m) => setMessages(prev => [...prev, m]);

    s.on('connect', () => {
      s.emit('join_room', { roomId, userId, sessionId });
    });

    s.on('joined', (data) => {
      setIsCreator(!!data.isCreator);
      const map = new Map();
      (data.participants || []).forEach(p => p?.userId && map.set(p.userId, p));
      setParticipantsMap(map);
      sessionStorage.setItem('activeRoom', roomId);
    });

    s.on('update_participants', (data) => {
      const map = new Map();
      (data.participants || []).forEach(p => p?.userId && map.set(p.userId, p));
      setParticipantsMap(map);
    });

    s.on('chat_history', (msgs) => {
      const mapped = (msgs || []).map(m => ({
        from: { name: m.sender_name, id: m.user_id },
        text: m.message,
        createdAt: m.created_at || new Date().toISOString()
      }));
      setMessages(mapped);
    });

    s.on('receive_message', (data) => {
      addMessage({
        from: data.from || { name: 'Неизвестно' },
        text: data.text,
        createdAt: new Date().toISOString()
      });
    });

    s.on('room_closed', () => {
      setRoomClosed(true);
      addMessage({ from: { name: 'Система' }, text: 'Комната закрыта создателем', createdAt: new Date().toISOString() });
      sessionStorage.removeItem('activeRoom');
    });

    s.on('game_started', () => setGameStarted(true));

    return () => s.disconnect();
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
    console.log("start game");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">
                Комната: <span className="text-blue-600 cursor-pointer underline"
                  title="Кликните, чтобы скопировать"
                  onClick={() => { navigator.clipboard.writeText(roomId).then(() => alert(`ID комнаты ${roomId} скопирован`)) }}
                >{roomId}</span>
              </h2>
              <p className="text-sm text-gray-500">Участников: {participantsMap.size}</p>
            </div>
            <div className="flex gap-2">
              {isCreator && !roomClosed && <button onClick={deleteRoom} className="px-3 py-2 bg-red-600 text-white rounded">Удалить комнату</button>}
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
                    <div key={i} className="mb-2">{m.from?.name === 'Система' ? <div className="text-sm text-gray-500 italic">{m.text}</div> : <div><b>{m.from?.name}:</b> {m.text}</div>}</div>
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
                    {Array.from(participantsMap.values()).map(p => {
                      const isCurrentUser = p.userId === userId;
                      return <li key={p.sessionId} className={`p-2 border rounded ${isCurrentUser ? 'bg-blue-100 font-semibold' : 'bg-white'}`}>
                        {p.name}{isCurrentUser && <span className="text-blue-600"> (Вы)</span>}{p.userId === userId && isCreator && <span className="text-green-600"> (Создатель)</span>}
                      </li>
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}




