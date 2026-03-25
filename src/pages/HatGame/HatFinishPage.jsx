import React, { useEffect, useMemo } from "react";

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="bg-[#1E293B] px-5 py-4 text-center">
            <h1 className="text-lg font-bold text-white">Игра завершена!</h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">Итоговые результаты</p>
          </div>

          <div className="p-5">
            {mode === "solo" ? (
              <div className="space-y-2">
                {sortedPlayers.map((p, index) => {
                  const playerScore = Number(scores[p.id]) || 0;
                  const isWinner = winners.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-md ${
                        isWinner
                          ? "bg-[#FEF9C3] border border-[#FDE047]"
                          : "bg-[#F8FAFC] border border-[#E2E8F0]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? "bg-[#FBBF24]" :
                          index === 1 ? "bg-[#94A3B8]" :
                          index === 2 ? "bg-[#B45309]" :
                          "bg-[#3B82F6]"
                        }`}>
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-[#1E293B]">
                            {p.name || getPlayerName(p.id)}
                          </span>
                          {isWinner && (
                            <span className="text-[8px] text-[#B45309] block">Победитель</span>
                          )}
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-[#3B82F6] rounded-md">
                        <span className="text-sm font-bold text-white">{playerScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {teams && teams.map((team, idx) => {
                  const isWinner = winners.includes(idx);
                  const teamScore = team.reduce((sum, id) => sum + (Number(scores[id]) || 0), 0);
                  
                  return (
                    <div
                      key={idx}
                      className={`rounded-md overflow-hidden ${
                        isWinner ? "border-2 border-[#FBBF24]" : "border border-[#E2E8F0]"
                      }`}
                    >
                      <div className={`px-3 py-2 ${isWinner ? "bg-[#FEF9C3]" : "bg-[#F8FAFC]"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#3B82F6] rounded-full flex items-center justify-center">
                              <span className="text-[8px] font-bold text-white">{idx + 1}</span>
                            </div>
                            <h3 className="text-xs font-semibold text-[#1E293B]">
                              Команда {idx + 1} {isWinner && "🏆"}
                            </h3>
                          </div>
                          <div className="px-2 py-1 bg-[#10B981] rounded">
                            <span className="text-xs font-bold text-white">{teamScore}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-3">
                        {team.map((id, playerIndex) => (
                          <div key={id} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] text-[#64748B] w-4">{playerIndex + 1}</span>
                              <span className="text-xs text-[#1E293B]">{getPlayerName(id)}</span>
                            </div>
                            <span className="text-xs font-medium text-[#3B82F6]">
                              {Number(scores[id]) || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center">
              <button
                className="h-9 px-6 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium rounded-md transition-colors"
                onClick={() => navigate(`/room/${roomId}`)}
              >
                Вернуться в комнату
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};