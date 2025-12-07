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
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col max-w-lg w-full items-start gap-4">
        
        <Card className="w-full rounded-2xl shadow-lg">
          <CardHeader className="gap-2 pb-6 text-center">
            <CardTitle className="text-2xl font-bold">
              Добро пожаловать
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {isRegisterMode ? 'Создайте аккаунт' : 'Войдите, чтобы продолжить'}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Имя</Label>
              <Input
                id="username"
                type="text"
                placeholder="Введите имя"
                value={authData.username}
                onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button 
              onClick={isRegisterMode ? handleRegister : handleLogin}
              className="w-full"
            >
              {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
            </Button>

            <div className="flex flex-col items-center w-full">
              <span className="text-sm">
                {isRegisterMode ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
              </span>
              <button 
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-sm text-blue-600 hover:underline transition-all"
              >
                {isRegisterMode ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

return (
  <div className="h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col max-w-lg w-full items-start gap-16">
      <Card className="w-full rounded-2xl shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-bold">
              Добро пожаловать, {name}!
            </h2>
          </div>
          
          <Button
            onClick={() => setIsProfileOpen(true)}
            variant="outline"
            className="mb-6"
          >
            Профиль
          </Button>

          <Button 
            onClick={createRoom}
            className="w-full mb-6"
          >
            Создать комнату
          </Button>

          <div className="relative mb-6">
            <Separator />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
            </div>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <div className="flex-1 flex flex-col gap-2">
              <Label htmlFor="roomId">ID комнаты</Label>
              <Input
                id="roomId"
                type="text"
                placeholder="Введите ID комнаты"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>

            <Button 
              onClick={joinById}
              variant="outline"
            >
              Присоединиться
            </Button>
          </div>

          {activeRoom && (
            <Button 
              onClick={goToActiveRoom}
              variant="secondary"
              className="w-full mb-6"
            >
              Перейти в активную комнату
            </Button>
          )}

          <div className="flex flex-col items-center pt-4 border-t">
            <Button 
              onClick={handleLogout} 
              variant="ghost"
            >
              Выйти из аккаунта
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
}
