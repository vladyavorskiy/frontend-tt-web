import React, { useEffect, useState } from "react";
import { CheckIcon } from "../../components/GameIcons";

export const HatRoundPage = ({
  userId,
  round,
  timer,
  activePlayer,
  guesser,
  currentWord,
  isCurrentExplainer,
  players,
  mode,
  getPlayerName,
  onReady,
  onWordGuessed
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isCurrentExplainer) {
      setIsReady(false);
    }
  }, [activePlayer, isCurrentExplainer]);

  const handleReady = () => {
    if (!isCurrentExplainer) return;
    setIsReady(true);
    onReady();
  };

  const handleWordGuessed = () => {
    onWordGuessed();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  let contentType = "spectating";
  if (isCurrentExplainer && !isReady) contentType = "ready";
  else if (isCurrentExplainer && isReady && currentWord) contentType = "word";
  else if (guesser === userId) contentType = "guess";

  const activePlayerName = getPlayerName(activePlayer);
  const guesserName = getPlayerName(guesser);

  return (
    <div className="flex flex-col rounded-lg bg-white overflow-hidden shadow-lg">
      <div className="flex flex-col gap-4 px-6 py-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-2xl leading-8">Раунд {round + 1}</h2>
          <div className="flex px-6 py-2 rounded-lg bg-black/30 items-center justify-center">
            <span className="text-white font-bold text-4xl leading-10 tabular-nums">{formatTime(timer)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-white/90 font-normal text-sm leading-5">Объясняет:</span>
            <span className="text-white font-semibold text-sm leading-5">{activePlayerName}</span>
            {isCurrentExplainer && (
              <div className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500">
                <span className="text-white font-normal text-xs leading-4">ЭТО ВЫ</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/90 font-normal text-sm leading-5">Отгадывает:</span>
            <span className="text-white font-semibold text-sm leading-5">{guesserName}</span>
            {guesser === userId && (
              <div className="ml-2 px-2 py-0.5 rounded-full bg-green-500">
                <span className="text-white font-normal text-xs leading-4">ЭТО ВЫ</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 items-center justify-center gap-8 px-6 py-12 min-h-[400px]">
        {contentType === "ready" && (
          <div className="text-center w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ваш ход</h3>
            <p className="text-sm text-gray-600 mb-6">Вы - объясняющий. Нажмите кнопку, когда будете готовы</p>
            <div className="flex justify-center">
              <button
                onClick={handleReady}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-colors"
              >
                Готов к ходу
              </button>
            </div>
          </div>
        )}

        {contentType === "word" && currentWord && (
          <div className="text-center w-full">
            <h1 className="text-blue-600 font-bold text-5xl sm:text-6xl leading-tight text-center tracking-wide mb-6">
              {currentWord}
            </h1>
            <p className="text-gray-500 text-lg leading-7 text-center mb-8">
              Объясняйте слово, не используя однокоренные!
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleWordGuessed}
                className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
              >
                <CheckIcon width={24} height={24} color="white" />
                <span className="text-white font-normal text-xl leading-7 tracking-wider">ОТГАДАНО</span>
              </button>
            </div>
          </div>
        )}

        {contentType === "word" && !currentWord && (
          <div className="text-center w-full">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Получение слова...</p>
          </div>
        )}

        {contentType === "guess" && (
          <div className="text-center w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Вы отгадываете</h3>
            <p className="text-sm text-gray-600 mb-4">Внимательно слушайте объясняющего</p>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        {contentType === "spectating" && (
          <div className="text-center w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Наблюдаем за игрой</h3>
            <p className="text-sm text-gray-600">Ждем завершения хода...</p>
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};