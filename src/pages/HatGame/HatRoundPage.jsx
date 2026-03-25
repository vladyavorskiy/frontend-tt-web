import React, { useEffect, useState } from "react";

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

  useEffect(() => {
    console.log("[HatRoundPage] Round state updated:", {
      round, activePlayer, guesser, currentWord, isCurrentExplainer, isReady, userId, timer
    });
  }, [round, activePlayer, guesser, currentWord, isCurrentExplainer, isReady, timer]);

  const handleReady = () => {
    if (!isCurrentExplainer) return;
    setIsReady(true);
    onReady();
  };

  const handleWordGuessed = () => {
    onWordGuessed();
  };

  let contentType = "spectating";
  if (isCurrentExplainer && !isReady) contentType = "ready";
  else if (isCurrentExplainer && isReady && currentWord) contentType = "word";
  else if (guesser === userId) contentType = "guess";

  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Header с информацией о раунде */}
      <div className="bg-[#1E293B] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Раунд {round + 1}</h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-[10px] text-[#94A3B8]">
                <span className="text-[#3B82F6]">Объясняет:</span> {getPlayerName(activePlayer)}
                {isCurrentExplainer && " (Вы)"}
              </p>
              <p className="text-[10px] text-[#94A3B8]">
                <span className="text-[#10B981]">Отгадывает:</span> {getPlayerName(guesser)}
                {guesser === userId && " (Вы)"}
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{timer}</div>
            <div className="text-[8px] text-[#94A3B8]">секунд</div>
          </div>
        </div>
      </div>

      {/* Контент в зависимости от роли */}
      <div className="p-8 min-h-[300px] flex items-center justify-center">
        {contentType === "ready" && (
          <div className="text-center">
            <h3 className="text-base font-semibold text-[#1E293B] mb-2">Ваш ход</h3>
            <p className="text-xs text-[#64748B] mb-4">Вы - объясняющий. Нажмите кнопку, когда будете готовы</p>
            <button
              onClick={handleReady}
              className="h-9 px-6 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium rounded-md transition-colors"
            >
              Готов к ходу
            </button>
          </div>
        )}

        {contentType === "word" && currentWord && (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-4xl font-bold text-[#1E293B] tracking-tight">{currentWord}</div>
              <p className="text-xs text-[#64748B] mt-2">Объясняйте, не называя слово</p>
            </div>
            <button
              onClick={handleWordGuessed}
              className="h-9 px-6 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium rounded-md transition-colors"
            >
              Отгадано ✓
            </button>
          </div>
        )}

        {contentType === "word" && !currentWord && (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-[#64748B]">Получение слова...</p>
          </div>
        )}

        {contentType === "guess" && (
          <div className="text-center">
            <h3 className="text-base font-semibold text-[#1E293B] mb-2">Вы отгадываете</h3>
            <p className="text-xs text-[#64748B]">Внимательно слушайте объясняющего</p>
            <div className="flex justify-center gap-1 mt-4">
              <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        {contentType === "spectating" && (
          <div className="text-center">
            <h3 className="text-base font-semibold text-[#1E293B] mb-2">Наблюдаем за игрой</h3>
            <p className="text-xs text-[#64748B]">Ждем завершения хода...</p>
          </div>
        )}
      </div>
    </div>
  );
};