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

  return (
    <section className="flex flex-col w-full items-start gap-6 relative">
      <Card className="w-full bg-white rounded-2xl border shadow-[0px_1px_2px_#0000000d]">
        <CardContent className="p-[25px] flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-ebony">Раунд {round + 1}</h2>
            <p className="text-gray-500 text-base">
              Объясняющий: {getPlayerName(activePlayer)}
              {isCurrentExplainer && " (Вы)"} | Отгадывающий:{" "}
              {mode === "team" ? `Team ${guesser}` : getPlayerName(guesser)}
            </p>
          </div>

          <div className="relative flex flex-col w-24 h-24 items-center justify-center">
            <img
              src="https://c.animaapp.com/mhm1yca0pRBZyA/img/component-1.svg"
              alt="timer"
              className="w-full h-full"
            />
            <span className="absolute text-2xl font-bold text-gray-700">{timer}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[360px] w-full bg-white rounded-2xl border shadow-[0px_1px_2px_#0000000d]">
        <CardContent className="flex items-center justify-center flex-col py-20">
          {contentType === "ready" && (
            <Button
              onClick={handleReady}
              className="max-w-xs w-80 h-20 bg-blue-600 text-3xl font-bold text-white rounded-2xl hover:bg-blue-700 transition"
            >
              Готов к ходу
            </Button>
          )}

          {contentType === "word" && currentWord && (
            <>
              <div className="max-w-md w-[448px] p-8 bg-cornflower-blue-10 rounded-2xl">
                <h3 className="text-5xl font-bold text-cornflower-blue text-center">
                  {currentWord}
                </h3>
              </div>
              <div className="pt-8">
                <Button
                  onClick={handleWordGuessed}
                  className="h-14 px-6 bg-green-600 rounded-xl hover:bg-green-700 transition"
                >
                  <CheckIcon className="w-6 h-6 mr-2" />
                  <span className="font-semibold text-white text-lg">
                    Отгадано
                  </span>
                </Button>
              </div>
            </>
          )}

          {contentType === "word" && !currentWord && (
            <div className="text-center">
              <p className="text-xl text-gray-500">Ожидайте слово...</p>
            </div>
          )}

          {contentType === "guess" && (
            <div className="text-center">
              <h3 className="text-4xl font-bold text-ebony-clay mb-2">
                Вы отгадываете слова
              </h3>
              <p className="text-lg text-pale-sky">
                Отгадывайте слова пока время не истекло
              </p>
            </div>
          )}

          {contentType === "spectating" && (
            <p className="text-xl text-gray-500">
              Ожидайте... {getPlayerName(activePlayer)} объясняет{" "}
              {mode === "team" ? `Team ${guesser}` : getPlayerName(guesser)}.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
