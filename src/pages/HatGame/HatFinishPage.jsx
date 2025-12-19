import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const HatFinishPage = ({
  mode,
  players,
  teams,
  scores,
  getPlayerName,
  navigate,
  roomId,
}) => {
  const sortedPlayers = useMemo(() => {
    if (!players || !scores) return [];
    
    return [...players].sort((a, b) => {
      const scoreA = Number(scores[a.id]) || 0;
      const scoreB = Number(scores[b.id]) || 0;
      
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      
      const nameA = a.name || getPlayerName(a.id) || '';
      const nameB = b.name || getPlayerName(b.id) || '';
      return nameA.localeCompare(nameB);
    });
  }, [players, scores, getPlayerName]);

  const winners = useMemo(() => {
    if (!scores) return [];

    if (mode === "solo") {
      const maxScore = Math.max(...Object.values(scores).map(s => Number(s) || 0));
      return Object.entries(scores)
        .filter(([id, score]) => Number(score) === maxScore)
        .map(([id]) => Number(id));
    } else if (mode === "team") {
      if (!teams) return [];
      const teamScores = teams.map((team) =>
        team.reduce((sum, id) => sum + (Number(scores[id]) || 0), 0)
      );
      const maxScore = Math.max(...teamScores);
      return teams
        .map((team, idx) => (teamScores[idx] === maxScore ? idx : -1))
        .filter((idx) => idx !== -1);
    }
    
    return [];
  }, [mode, scores, teams]);

  useEffect(() => {
    console.log("[HatFinishPage] Game finished. Mode:", mode);
    console.log("[HatFinishPage] Sorted players:", sortedPlayers.map(p => ({
      name: p.name || getPlayerName(p.id),
      id: p.id,
      score: Number(scores[p.id]) || 0
    })));
    console.log("[HatFinishPage] Winners:", winners);
    console.log("[HatFinishPage] Scores object:", scores);
  }, [mode, sortedPlayers, winners, scores, getPlayerName]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-block p-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
              Игра завершена!
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Итоговые результаты игры
          </p>
        </div>

        {mode === "solo" ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
                <h2 className="text-2xl font-bold text-center">Таблица очков</h2>
              </div>
              <div className="p-6 space-y-4">
                {sortedPlayers.map((p, index) => {
                  const playerScore = Number(scores[p.id]) || 0;
                  const isWinner = winners.includes(p.id);
                  
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        isWinner 
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-2 border-yellow-300 dark:border-yellow-700" 
                          : "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${
                            index === 0 ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" :
                            index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white" :
                            index === 2 ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white" :
                            "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          }`}>
                            {index + 1}
                          </div>
                          {isWinner && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                              <span className="text-sm">👑</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-800 dark:text-white">
                            {p.name || getPlayerName(p.id)}
                          </h3>
                          {isWinner && (
                            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                              Победитель
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                          <span className="text-3xl font-bold text-white">
                            {playerScore}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {index === 0 ? "1 место" : `${index + 1} место`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
                <h2 className="text-2xl font-bold text-center">Результаты команд</h2>
              </div>
              <div className="p-6 space-y-6">
                {teams && teams.map((team, idx) => {
                  const isWinner = winners.includes(idx);
                  const teamScore = team.reduce((sum, id) => sum + (Number(scores[id]) || 0), 0);
                  
                  const sortedTeamPlayers = [...team].sort((a, b) => {
                    const scoreA = Number(scores[a]) || 0;
                    const scoreB = Number(scores[b]) || 0;
                    return scoreB - scoreA;
                  });

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl overflow-hidden ${
                        isWinner 
                          ? "border-2 border-yellow-400 dark:border-yellow-600" 
                          : "border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className={`p-4 ${
                        isWinner 
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30" 
                          : "bg-gray-50 dark:bg-gray-900/50"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isWinner 
                                ? "bg-gradient-to-r from-yellow-500 to-orange-500" 
                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                            }`}>
                              <span className="text-white font-bold">{idx + 1}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                              Команда {idx + 1}
                              {isWinner && " 🏆"}
                            </h3>
                          </div>
                          <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                            <span className="text-2xl font-bold text-white">
                              {teamScore} очков
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-4">
                        <ul className="space-y-3">
                          {sortedTeamPlayers.map((id, playerIndex) => {
                            const playerScore = Number(scores[id]) || 0;
                            return (
                              <li key={id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {playerIndex + 1}
                                  </div>
                                  <span className="font-medium text-gray-800 dark:text-white">
                                    {getPlayerName(id)}
                                  </span>
                                </div>
                                <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg font-bold text-blue-600 dark:text-blue-400">
                                  {playerScore}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-6">
          <Button
            className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate(`/room/${roomId}`)}
          >
            Вернуться в комнату
          </Button>
          
        </div>
      </div>
    </div>
  );
};