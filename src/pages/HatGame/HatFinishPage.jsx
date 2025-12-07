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
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h2 className="text-3xl font-bold text-center mb-4">Игра закончена</h2>

      {mode === "solo" ? (
        <div className="flex flex-col gap-2">
          {sortedPlayers.map((p, index) => {
            const playerScore = Number(scores[p.id]) || 0;
            const isWinner = winners.includes(p.id);
            
            return (
              <Card
                key={p.id}
                className={`p-4 ${isWinner ? "bg-yellow-200 border-2 border-yellow-400" : ""}`}
              >
                <CardContent className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                      <span className="font-bold text-gray-700">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {p.name || getPlayerName(p.id)}
                      </span>
                      {isWinner && (
                        <span className="text-xs text-yellow-700 font-medium">
                          🏆 Победитель
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="font-bold text-xl">{playerScore}</span>
                    <div className="text-sm text-gray-500">
                      {playerScore === Math.max(...Object.values(scores).map(s => Number(s) || 0)) 
                        ? "1 место" 
                        : `${index + 1} место`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {teams && teams.map((team, idx) => {
            const isWinner = winners.includes(idx);
            const teamScore = team.reduce((sum, id) => sum + (Number(scores[id]) || 0), 0);
            
            const sortedTeamPlayers = [...team].sort((a, b) => {
              const scoreA = Number(scores[a]) || 0;
              const scoreB = Number(scores[b]) || 0;
              return scoreB - scoreA;
            });

            return (
              <Card
                key={idx}
                className={`p-4 flex flex-col gap-2 ${isWinner ? "bg-yellow-200 border-2 border-yellow-400" : ""}`}
              >
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">
                      Команда {idx + 1} 
                      {isWinner && " 🏆"}
                    </h3>
                    <span className="font-bold text-xl">Очки: {teamScore}</span>
                  </div>
                  
                  <ul className="space-y-2">
                    {sortedTeamPlayers.map((id, playerIndex) => {
                      const playerScore = Number(scores[id]) || 0;
                      return (
                        <li key={id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">#{playerIndex + 1}</span>
                            <span>{getPlayerName(id)}</span>
                          </div>
                          <span className="font-semibold">{playerScore}</span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => navigate(`/room/${roomId}`)}
        >
          Вернуться в комнату
        </Button>
      </div>
    </div>
  );
};