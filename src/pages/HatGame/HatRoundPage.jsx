import React, { useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      round,
      activePlayer,
      guesser,
      currentWord,
      isCurrentExplainer,
      isReady,
      userId,
      timer
    });
  }, [round, activePlayer, guesser, currentWord, isCurrentExplainer, isReady, timer]);

  const handleReady = () => {
    if (!isCurrentExplainer) return;
    console.log("[HatRoundPage] Player is ready:", userId);
    setIsReady(true);
    onReady();
  };

  const handleWordGuessed = () => {
    console.log("[HatRoundPage] Word guessed by:", userId, "Word:", currentWord);
    onWordGuessed();
  };

  let contentType = "spectating";
  if (isCurrentExplainer && !isReady) contentType = "ready";
  else if (isCurrentExplainer && isReady && currentWord) contentType = "word";
  else if (guesser === userId) contentType = "guess";
  
  const isInGuessingTeam = mode === "team" && guesser === userId;

  return (
    <section className="flex flex-col w-full items-center gap-6 p-4 md:p-6 max-w-6xl mx-auto">
      <Card className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-blue-100 dark:border-gray-700 shadow-lg">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                Раунд {round + 1}
              </h2>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-200 text-lg md:text-xl">
                <span className="font-bold text-blue-600 dark:text-blue-400">Объясняющий:</span>{" "}
                {getPlayerName(activePlayer)}
                {isCurrentExplainer && " (Вы)"}
              </p>
              <p className="text-gray-700 dark:text-gray-200 text-lg md:text-xl">
                <span className="font-bold text-green-600 dark:text-green-400">Отгадывающий:</span>{" "}
                {mode === "team" 
                  ? `Team ${guesser}${isInGuessingTeam ? " (Ваша команда)" : ""}`
                  : `${getPlayerName(guesser)}${guesser === userId ? " (Вы)" : ""}`
                }
              </p>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse opacity-20"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 border-4 border-blue-200 dark:border-gray-700"></div>
              <span className="relative text-4xl font-bold text-blue-600 dark:text-blue-400">
                {timer}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">секунд</p>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[400px] w-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-lg">
        <CardContent className="flex items-center justify-center flex-col p-8 md:p-12">
          {contentType === "ready" && (
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                  Ваш ход
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md">
                  Вы - объясняющий. Нажмите кнопку, когда будете готовы начать объяснение
                </p>
              </div>
              <Button
                onClick={handleReady}
                className="h-16 px-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-2xl font-bold text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Готов к ходу
              </Button>
            </div>
          )}

          {contentType === "word" && currentWord && (
            <div className="text-center space-y-8">
              <div className="max-w-2xl w-full p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl border-2 border-blue-100 dark:border-gray-700 shadow-inner">
                <h3 className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 text-center tracking-wide">
                  {currentWord}
                </h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Вы - объясняющий. Объясняйте слово не называя его и однокоренные
                </p>
                <Button
                  onClick={handleWordGuessed}
                  className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <CheckIcon className="w-6 h-6 mr-3" />
                  <span className="font-bold text-xl">
                    Отгадано
                  </span>
                </Button>
              </div>
            </div>
          )}

          {contentType === "word" && !currentWord && (
            <div className="text-center space-y-6">
              <div className="animate-pulse">
                <div className="w-64 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto"></div>
              </div>
              <p className="text-xl text-gray-500 dark:text-gray-400">Вы - объясняющий. Получение слова...</p>
            </div>
          )}

          {contentType === "guess" && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                  {mode === "team" ? "Ваша команда отгадывает слова" : "Вы отгадываете слова"}
                </h3>
                <div className="inline-block p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-xl">
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
                    {mode === "team" 
                      ? "Ваша команда отгадывает. Внимательно слушайте объясняющего!" 
                      : "Вы - отгадывающий. Внимательно слушайте объясняющего!"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-lg">
                  {mode === "team" ? "Ждем объяснения для вашей команды..." : "Ждем объяснения..."}
                </p>
              </div>
            </div>
          )}

          {contentType === "spectating" && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                  Наблюдаем за игрой
                </h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Ждем завершения хода...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};