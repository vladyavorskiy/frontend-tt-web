// import { io } from 'socket.io-client';

// const WS_BASE = import.meta.env.VITE_WS_BASE || 'http://localhost:4000';

// const socket = io(WS_BASE, { autoConnect: false });

// socket.on('error_message', (errorMessage) => {
//   console.error('[Socket] Server error:', errorMessage);
// });

// export default socket;




import { io } from 'socket.io-client';

const WS_BASE = import.meta.env.VITE_WS_BASE || 'http://localhost:4000';

const socket = io(WS_BASE, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Ошибки сервера
socket.on('error_message', (msg) => {
  console.error('[Socket] Server error:', msg);
});

// Ошибки соединения
socket.on('connect_error', (err) => {
  console.error('[Socket] Connection error:', err.message);
});

// Подключение / отключение
socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));

// Комната
socket.on('active_room_info', (data) => console.log('[Socket] Active room info:', data));
socket.on('joined', (data) => console.log('[Socket] Joined room:', data));
socket.on('leave_error', (data) => console.error('[Socket] Leave room error:', data));
socket.on('left_room_success', (data) => console.log('[Socket] Left room successfully:', data));
socket.on('room_not_found', () => console.error('[Socket] Room not found'));
socket.on('room_closed', () => console.log('[Socket] Room closed'));

// Чат
socket.on('chat_history', (messages) => console.log('[Socket] Chat history received:', messages));
socket.on('receive_message', ({ from, text }) => console.log(`[Socket] ${from.name}: ${text}`));

// Роли
socket.on('role_info', ({ isCreator }) => console.log('[Socket] Role info:', isCreator ? 'Creator' : 'Participant'));

// Игровые события
socket.on('phase_changed', (data) => console.log('[Socket] Phase changed:', data));
socket.on('waiting_for_players', (data) => console.log('[Socket] Waiting for players:', data));
socket.on('reveal_word', ({ word }) => console.log('[Socket] Reveal word:', word));
socket.on('next_word', ({ word, scores }) => console.log('[Socket] Next word:', word, 'Scores:', scores));
socket.on('game_started', () => console.log('[Socket] Game started'));

// Экспортируем socket для использования в компонентах
export default socket;
