import React, { useState } from "react";
import { HatIcon, LetterIcon, CardsIcon, CheckIcon } from "../components/GameIcons.jsx";

export default function GameSelectionModal({ onClose, onSelectGame, showToast }) {
  const [selectedGame, setSelectedGame] = useState("hat");

  const games = [
    {
      id: "hat",
      name: "Шляпа",
      description: "Объясняйте слова, не называя их",
      IconComponent: HatIcon,
      available: true,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "drawing",
      name: "На букву",
      description: "Назовите как можно больше слов на букву",
      IconComponent: LetterIcon,
      available: false,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "quiz",
      name: "Сундучки",
      description: "Собирайте четыре карты одного номинала",
      IconComponent: CardsIcon,
      available: false,
      color: "from-orange-500 to-red-500"
    }
  ];

  const handleSelect = () => {
    if (selectedGame === "hat") {
      onSelectGame();
    } else {
      const game = games.find(g => g.id === selectedGame);
      showToast('error', `Игра "${game.name}" пока не доступна. Скоро появится`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Выбор игры</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md hover:bg-white/20 flex items-center justify-center transition-colors text-white text-xl"
            >
              ✕
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-1">Выберите игру для начала</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {games.map((game) => {
              const Icon = game.IconComponent;
              const isSelected = selectedGame === game.id;
              
              return (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? `border-blue-500 bg-blue-50`
                      : `border-gray-200 hover:border-gray-300 bg-white`
                  } ${!game.available ? 'opacity-60' : ''}`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon width={32} height={32} color="white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
                    <p className="text-sm text-gray-500">{game.description}</p>
                    {!game.available && (
                      <span className="text-xs text-orange-500 mt-1 inline-block">Скоро появится</span>
                    )}
                  </div>
                  {isSelected && (
                    <CheckIcon width={24} height={24} color="#3B82F6" className="flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSelect}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              {selectedGame === "hat" ? "Начать игру" : "Попробовать"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}