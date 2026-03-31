// Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronIcon, 
  ProfileIcon, 
  LogoutIcon 
} from "../components/GameIcons";

export default function Header({ user, onProfileClick, onLogout, isInGame = false }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userLetter = user?.username?.charAt(0).toUpperCase() || 'П';
  const userName = user?.username || 'Пользователь';
  const userEmail = user?.email || 'user@example.com';

  return (
    <>
      <header className="flex h-[73px] px-4 sm:px-8 lg:px-[122px] flex-col justify-center items-center border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
        <div className="flex justify-between items-center w-full">
          <Link to={isInGame ? '#' : '/'} className="flex flex-col items-start">
            <span className="text-black font-bold text-2xl leading-8">TableTime</span>
            <span className="text-gray-500 text-xs font-normal leading-4">Игра в слова онлайн</span>
          </Link>

          <div className="relative flex flex-col items-start" ref={dropdownRef}>
            <div className="flex h-12 flex-col justify-center items-center">
              <button
                onClick={() => !isInGame && setOpen(!open)}
                className={`flex items-center gap-3 px-2 pl-1 py-1 rounded-full border border-gray-200 bg-gray-50 cursor-pointer ${isInGame ? 'opacity-50' : ''}`}
                disabled={isInGame}
              >
                <div className="flex w-9 h-9 justify-center items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700">
                  <span className="text-white text-sm font-semibold">{userLetter}</span>
                </div>
                <span className="text-gray-700 text-sm font-medium hidden sm:block">{userName}</span>
                <ChevronIcon 
                  width={20} 
                  height={20} 
                  color="#6B7280"
                  className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {open && !isInGame && (
              <div className="absolute right-0 top-full mt-2 w-[222px] min-w-[222px] flex flex-col items-start rounded-xl border border-gray-200 bg-white z-50 shadow-lg">
                <div className="flex min-w-[220px] px-4 py-4 flex-col items-start gap-0.5 self-stretch border-b border-gray-100">
                  <span className="text-gray-900 text-base font-semibold">{userName}</span>
                  <span className="text-gray-500 text-xs">{userEmail}</span>
                </div>

                <button
                  onClick={() => { setOpen(false); onProfileClick?.(); }}
                  className="flex w-[220px] px-4 py-3 items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <ProfileIcon width={20} height={20} color="#6B7280" />
                  <span className="text-gray-700 text-sm">Мой профиль</span>
                </button>

                <button
                  onClick={() => { setOpen(false); onLogout?.(); }}
                  className="flex w-[220px] px-4 py-3 items-center gap-3 border-t border-gray-100 hover:bg-red-50 transition-colors"
                >
                  <LogoutIcon width={20} height={20} color="#EF4444" />
                  <span className="text-red-500 text-sm">Выйти из аккаунта</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {isInGame && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 rounded-md px-3 py-1.5 text-xs text-yellow-800 shadow-sm z-50">
          Во время игры нельзя редактировать профиль и выходить из аккаунта
        </div>
      )}
    </>
  );
}