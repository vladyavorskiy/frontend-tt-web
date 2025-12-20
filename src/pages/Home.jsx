import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import socket from "../socketClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import * as Toast from '@radix-ui/react-toast';
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

export default function HomePage({showToast}) {
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

    const userId = Number(sessionStorage.getItem("userId"));
    const sessionId = sessionStorage.getItem("sessionId");

    sessionStorage.setItem("activeRoom", roomId.trim());
    navigate(`/room/${roomId.trim()}`);

    if (!socket.connected) socket.connect();
    socket.emit("join_room", { roomId: roomId.trim(), userId, sessionId });
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
        showToast('error',"Имя не может быть пустым");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8">
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold">
                TableTime
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                {isRegisterMode ? 'Создайте аккаунт' : 'Войдите, чтобы продолжить'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-semibold text-gray-700 dark:text-gray-300">
                Имя пользователя
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Введите имя"
                value={authData.username}
                onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
                className="h-12 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-gray-700 dark:text-gray-300">
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                className="h-12 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <Button 
              onClick={isRegisterMode ? handleRegister : handleLogin}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
            </Button>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                {isRegisterMode ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
              </p>
              <button 
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-lg transition-colors mt-2"
              >
                {isRegisterMode ? 'Войти в аккаунт' : 'Создать аккаунт'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
    <div className="w-full max-w-2xl">
      <Card className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <CardTitle className="text-3xl font-bold">TableTime</CardTitle>
                <CardDescription className="text-blue-100 text-lg">
                  Игра в слова онлайн
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setIsProfileOpen(true)}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <i className="fas fa-user mr-2"></i>Профиль
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Добро пожаловать, <span className="text-blue-600 dark:text-blue-400">{name}</span>!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {activeRoom 
                ? 'У вас есть активная комната'
                : 'Создайте комнату или присоединитесь к существующей'}
            </p>
          </div>

          {activeRoom ? (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                
                <Button 
                  onClick={goToActiveRoom}
                  className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <i className="fas fa-door-open mr-2"></i>
                  Вернуться в комнату
                </Button>

                <div className="flex items-center justify-between mt-8">
                  <div>
                    <p className="text-yellow-600 dark:text-yellow-500">
                      Вы уже находитесь в комнате
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg">
                    <code className="font-mono font-bold text-yellow-700 dark:text-yellow-400">
                      {activeRoom}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Button 
                onClick={createRoom}
                className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl text-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <i className="fas fa-plus-circle mr-3"></i>
                Создать комнату
              </Button>

              <div className="relative">
                <Separator />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">или</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="roomId" className="font-semibold text-gray-700 dark:text-gray-300 text-lg">
                  Присоединиться по ID
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="roomId"
                    type="text"
                    placeholder="Введите ID комнаты"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="h-12 flex-1 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <Button 
                    onClick={joinById}
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Войти
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <Button 
              onClick={handleLogout} 
              variant="ghost"
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 px-6 py-2 rounded-lg font-semibold transition-all"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Выйти из аккаунта
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onSave={updateProfile}
      />
    </div>
  </div>
);
}