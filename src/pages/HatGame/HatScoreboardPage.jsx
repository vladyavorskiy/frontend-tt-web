import React, { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const HatScoreboardPage = ({
  players,
  scores,
  onEndGame,
  getPlayerName,
}) => {
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const scoreB = Number(scores[b.id]) || 0;
      const scoreA = Number(scores[a.id]) || 0;
      
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      
      const nameA = getPlayerName(a.id) || '';
      const nameB = getPlayerName(b.id) || '';
      return nameA.localeCompare(nameB);
    });
  }, [players, scores, getPlayerName]);

  const maxScore = useMemo(() => {
    const values = Object.values(scores).map(s => Number(s) || 0);
    return Math.max(...values);
  }, [scores]);

  console.log("[HatScoreboardPage] Sorted players with scores:", 
    sortedPlayers.map(p => ({
      name: getPlayerName(p.id),
      score: Number(scores[p.id]) || 0,
      isLeader: (Number(scores[p.id]) || 0) === maxScore
    }))
  );

  return (
    <section className="w-full">
      <Card className="w-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl mb-4">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                Победные очки
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Текущие результаты игры
            </p>
          </div>

          <div className="space-y-3">
            {sortedPlayers.map((p, index) => {
              const playerScore = Number(scores[p.id]) || 0;
              const isLeader = playerScore === maxScore && maxScore > 0;
              
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all transform hover:scale-[1.02] ${
                    isLeader 
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-2 border-yellow-300 dark:border-yellow-700" 
                      : "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className={`w-12 h-12 ${isLeader ? 'ring-2 ring-yellow-400 dark:ring-yellow-600' : ''}`}>
                        <AvatarFallback className={`font-bold text-lg ${
                          index === 0 ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" :
                          index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white" :
                          index === 2 ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white" :
                          "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        }`}>
                          {index + 1}
                        </AvatarFallback>
                      </Avatar>
                      {isLeader && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">👑</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 dark:text-white text-lg">
                        {getPlayerName(p.id)}
                      </span>
                      {isLeader && (
                        <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                          Лидер игры
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`px-4 py-2 rounded-lg ${
                      isLeader 
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500" 
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}>
                      <span className="text-2xl font-bold text-white">
                        {playerScore}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {playerScore} очков
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Всего игроков: <span className="font-bold">{sortedPlayers.length}</span>
              </div>
              <Button
                variant="outline"
                className="border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl px-6 py-3 font-semibold transition-all"
                onClick={onEndGame}
              >
                Закончить игру
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};