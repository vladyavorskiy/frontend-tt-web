import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import socket from "../socketClient";
import ProfileModal from "./ProfileModal";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

function ensureSessionId() {
  if (!sessionStorage.getItem("sessionId")) {
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    sessionStorage.setItem("sessionId", id);
  }
}

export default function HomePage({ showToast }) {
  ensureSessionId();
  const navigate = useNavigate();

  const [name, setName] = useState(sessionStorage.getItem("userName") || "");
  const [roomId, setRoomId] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState({ username: "", id: null });
  const [error, setError] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authData, setAuthData] = useState({ username: "", password: "" });
  const [activeRoom, setActiveRoom] = useState(sessionStorage.getItem("activeRoom") || "");

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) fetchProfile(token);
    else setIsAuthChecked(true);

    const handleSocketError = (errorMessage) => {
      console.error("[Home] Socket error:", errorMessage);
      setError(`Ошибка соединения: ${errorMessage}`);
    };
    const handleConnectError = (err) => console.error("[Home] Socket connect error:", err.message);
    const handleDisconnect = (reason) => console.log("[Home] Socket disconnected:", reason);

    socket.on("error_message", handleSocketError);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("error_message", handleSocketError);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch(`${API}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Ошибка загрузки профиля");
      const data = await res.json();
      setUser(data);
      setName(data.username);
      sessionStorage.setItem("userName", data.username);
      sessionStorage.setItem("userId", data.id);
      setIsAuthChecked(true);
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  const checkActiveRoom = (userId) => {
    if (!userId) return;
    if (!socket.connected) socket.connect();
    socket.emit("check_active_room", { userId: Number(userId) });
  };

  useEffect(() => {
    if (!user?.id) return;
    checkActiveRoom(user.id);

    const handler = (data) => {
      if (data?.roomId) {
        sessionStorage.setItem("activeRoom", data.roomId);
        setActiveRoom(data.roomId);
      } else {
        sessionStorage.removeItem("activeRoom");
        setActiveRoom("");
      }
    };

    socket.on("active_room_info", handler);
    return () => socket.off("active_room_info", handler);
  }, [user?.id]);

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка регистрации");

      Cookies.set("token", data.token, { expires: 7 });
      sessionStorage.setItem("userName", data.user.username);
      sessionStorage.setItem("userId", data.user.id);
      setUser(data.user);
      setName(data.user.username);
      setIsAuthChecked(true);
      checkActiveRoom(data.user.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка авторизации");

      Cookies.set("token", data.token, { expires: 7 });
      sessionStorage.setItem("userName", data.user.username);
      sessionStorage.setItem("userId", data.user.id);
      setUser(data.user);
      setName(data.user.username);
      setIsAuthChecked(true);
      checkActiveRoom(data.user.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("activeRoom");
    setUser({ username: "", id: null });
    setIsAuthChecked(true);
    setIsRegisterMode(false);
  };

  const saveNameToSession = () => {
    const trimmed = (name || "").trim();
    if (!trimmed) {
      showToast('error', "Введите имя!");
      return false;
    }
    sessionStorage.setItem("userName", trimmed);
    return true;
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!saveNameToSession()) return;
    const creatorUserId = sessionStorage.getItem("userId");
    const sessionId = sessionStorage.getItem("sessionId");
    if (!creatorUserId) {
      showToast('error', "Вы не авторизованы");
      return;
    }

    try {
      const res = await fetch(`${API}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorUserId, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка при создании комнаты");

      sessionStorage.setItem("activeRoom", data.id);
      navigate(`/room/${data.id}`);

      if (!socket.connected) socket.connect();
      socket.emit("join_room", { roomId: data.id, userId: Number(creatorUserId), sessionId });
    } catch (err) {
      console.error("[Home] Create room error:", err);
      showToast('error', `Ошибка при создании комнаты: ${err.message}`);
    }
  };

  const joinById = (e) => {
    e.preventDefault();
    if (!saveNameToSession()) return;
    if (!roomId.trim()) return showToast('default', "Введите ID комнаты");
    let roomIdToJoin = roomId.trim();
    if (roomIdToJoin.includes("://")) {
      roomIdToJoin = roomIdToJoin.split("/").filter(Boolean).pop();
    }

    const userId = Number(sessionStorage.getItem("userId"));
    const sessionId = sessionStorage.getItem("sessionId");

    sessionStorage.setItem("activeRoom", roomIdToJoin);
    navigate(`/room/${roomIdToJoin}`);

    if (!socket.connected) socket.connect();
    socket.emit("join_room", { roomId: roomIdToJoin, userId, sessionId });
  };

  const goToActiveRoom = () => {
    const activeRoom = sessionStorage.getItem("activeRoom");
    if (activeRoom) navigate(`/room/${activeRoom}`);
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
      setName(data.user.username);
      sessionStorage.setItem("userName", data.user.username);
      sessionStorage.setItem("userId", data.user.id);
      showToast('success', "Профиль успешно обновлен");
    } catch (err) {
      throw err;
    }
  };

  if (!Cookies.get('token') && isAuthChecked) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="bg-[#1E293B] p-6">
              <h1 className="text-2xl font-bold text-white text-center tracking-tight">TableTime</h1>
              <p className="text-[#94A3B8] text-sm text-center mt-1">
                {isRegisterMode ? 'Создайте аккаунт' : 'Войдите, чтобы продолжить'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1E293B]">Имя пользователя</label>
                <input
                  type="text"
                  value={authData.username}
                  onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-md text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                  placeholder="Введите имя"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1E293B]">Пароль</label>
                <input
                  type="password"
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-md text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                  placeholder="Введите пароль"
                />
              </div>

              {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-xs text-center">{error}</p>
                </div>
              )}

              <button
                onClick={isRegisterMode ? handleRegister : handleLogin}
                className="w-full h-10 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium rounded-md transition-colors"
              >
                {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
              </button>

              <div className="text-center pt-3 border-t border-[#E2E8F0]">
                <p className="text-xs text-[#64748B]">
                  {isRegisterMode ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
                </p>
                <button
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium transition-colors mt-1"
                >
                  {isRegisterMode ? 'Войти' : 'Создать аккаунт'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="bg-[#1E293B] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">TableTime</h1>
                <p className="text-[#94A3B8] text-xs mt-0.5">Игра в слова онлайн</p>
              </div>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="px-3 py-1.5 bg-[#2D3A4F] hover:bg-[#3B4A63] text-white text-xs font-medium rounded-md transition-colors"
              >
                Профиль
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-base font-medium text-[#1E293B]">
                Добро пожаловать, <span className="text-[#3B82F6] font-semibold">{name}</span>!
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                {activeRoom
                  ? 'У вас есть активная комната'
                  : 'Создайте комнату или присоединитесь к существующей'}
              </p>
            </div>

            {activeRoom ? (
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-4">
                <button
                  onClick={goToActiveRoom}
                  className="w-full h-10 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium rounded-md transition-colors"
                >
                  Вернуться в комнату
                </button>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E2E8F0]">
                  <p className="text-xs text-[#64748B]">Активная комната:</p>
                  <div className="px-2 py-1 bg-white border border-[#E2E8F0] rounded font-mono text-xs text-[#1E293B]">
                    {activeRoom}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={createRoom}
                  className="w-full h-11 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium rounded-md transition-colors"
                >
                  Создать комнату
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E2E8F0]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-[#64748B]">или</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#1E293B]">Присоединиться по ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Введите ID комнаты"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="flex-1 h-10 px-3 bg-white border border-[#CBD5E1] rounded-md text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                    />
                    <button
                      onClick={joinById}
                      className="px-4 h-10 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium rounded-md transition-colors"
                    >
                      Войти
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center">
              <button
                onClick={handleLogout}
                className="text-[#EF4444] hover:text-[#DC2626] text-xs font-medium transition-colors"
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onSave={updateProfile}
          showToast={showToast}
        />
      </div>
    </div>
  );
}