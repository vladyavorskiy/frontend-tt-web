import { io } from 'socket.io-client';

const WS_BASE = import.meta.env.VITE_WS_BASE || 'http://localhost:4000';

const socket = io(WS_BASE, { autoConnect: false });

export default socket;
