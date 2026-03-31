import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import socket from "../socketClient";
import ProfileModal from "./ProfileModal";
import Header from "./Header";

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
    console.log("handleRegister called with:", authData);
    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });
      console.log("Register response status:", res.status);
      const data = await res.json();
      console.log("Register response data:", data);
      
      if (!res.ok) throw new Error(data.message || "Ошибка регистрации");

      Cookies.set("token", data.token, { expires: 7 });
      sessionStorage.setItem("userName", data.user.username);
      sessionStorage.setItem("userId", data.user.id);
      setUser(data.user);
      setName(data.user.username);
      setIsAuthChecked(true);
      checkActiveRoom(data.user.id);
      console.log("Registration successful, user set:", data.user);
    } catch (err) {
      console.error("Register error:", err);
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    console.log("handleLogin called with:", authData);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });
      console.log("Login response status:", res.status);
      const data = await res.json();
      console.log("Login response data:", data);
      
      if (!res.ok) throw new Error(data.message || "Ошибка авторизации");

      Cookies.set("token", data.token, { expires: 7 });
      sessionStorage.setItem("userName", data.user.username);
      sessionStorage.setItem("userId", data.user.id);
      setUser(data.user);
      setName(data.user.username);
      setIsAuthChecked(true);
      checkActiveRoom(data.user.id);
      console.log("Login successful, user set:", data.user);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("activeRoom");
    sessionStorage.removeItem("isCreator");
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
    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log("Form submitted, isRegisterMode:", isRegisterMode);
      
      if (isRegisterMode) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-[448px]">
          <div className="rounded-lg overflow-hidden bg-white shadow-lg">
            <div className="bg-[#00277D] px-6 py-6 flex flex-col items-center gap-1">
              <h1 className="text-white text-2xl font-bold text-center">TableTime</h1>
              <p className="text-gray-300 text-base text-center">
                {isRegisterMode ? 'Создайте аккаунт' : 'Вход в аккаунт'}
              </p>
            </div>

            <div className="px-6 py-6 flex flex-col gap-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-700 text-sm font-medium">Имя пользователя</label>
                  <input
                    type="text"
                    value={authData.username}
                    onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
                    placeholder="Введите имя пользователя"
                    autoComplete="username"
                    required
                    className="w-full px-3 py-2.5 rounded-md border border-gray-300 bg-white text-base text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-700 text-sm font-medium">Пароль</label>
                  <input
                    type="password"
                    value={authData.password}
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                    placeholder="Введите пароль"
                    autoComplete={isRegisterMode ? "new-password" : "current-password"}
                    required
                    className="w-full px-3 py-2.5 rounded-md border border-gray-300 bg-white text-base text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-medium tracking-wider py-2.5 rounded-md transition-colors uppercase"
                >
                  {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">или</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <p className="text-center text-gray-700 text-sm">
                {isRegisterMode ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError('');
                    setAuthData({ username: '', password: '' });
                  }}
                  className="text-[#2563EB] font-medium hover:underline"
                >
                  {isRegisterMode ? 'Войти' : 'Зарегистрироваться'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header user={user} onProfileClick={() => setIsProfileOpen(true)} onLogout={handleLogout} />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[466px] bg-white rounded-lg shadow-lg p-6">
          {activeRoom ? (
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-2 w-full">
                <h2 className="text-black font-semibold text-xl text-center">
                  Добро пожаловать, {name}!
                </h2>
                <p className="text-gray-600 text-sm text-center">
                  У вас есть активная комната
                </p>
              </div>

              <div className="w-full flex flex-col items-center gap-2.5 px-6 py-[18px] rounded-lg border-2 border-gray-200 bg-gray-50">
                <button
                  onClick={goToActiveRoom}
                  className="w-full py-2 px-5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-base font-medium rounded-md transition-colors uppercase tracking-wide"
                >
                  Вернуться в комнату
                </button>
                <div className="flex flex-col items-center gap-1 w-full">
                  <p className="text-gray-600 text-sm text-center">
                    Активная комната:
                  </p>
                  <p className="text-black font-semibold text-lg text-center">
                    {activeRoom}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2 px-5 bg-white hover:bg-gray-50 rounded-md border border-gray-300 text-black text-base font-medium transition-colors"
              >
                Выйти из аккаунта
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-2 w-full">
                <h2 className="text-black font-semibold text-xl text-center">
                  Добро пожаловать, {name}!
                </h2>
                <p className="text-gray-600 text-sm text-center">
                  Создайте или присоединитесь к комнате
                </p>
              </div>

              <button
                onClick={createRoom}
                className="w-full py-2 px-5 bg-[#16A34A] hover:bg-[#15803d] text-white text-base font-medium rounded-md transition-colors uppercase tracking-wide"
              >
                Создать комнату
              </button>

              <div className="relative flex items-center w-full">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="px-2 bg-white text-gray-500 text-xs uppercase">
                  или
                </span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-gray-700 text-sm font-medium">
                  Присоединиться по ID
                </label>
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Введите ID комнаты"
                    className="flex-1 px-3 py-2.5 rounded-md border border-gray-300 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && joinById(e)}
                  />
                  <button
                    onClick={joinById}
                    className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] rounded-md text-white text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Войти
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2 px-5 bg-white hover:bg-gray-50 rounded-md border border-gray-300 text-black text-base font-medium transition-colors"
              >
                Выйти из аккаунта
              </button>
            </div>
          )}
        </div>
      </main>

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