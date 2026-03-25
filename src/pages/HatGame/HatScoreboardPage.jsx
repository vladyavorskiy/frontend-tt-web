import React, { useMemo } from "react";

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

  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="bg-[#1E293B] px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Победные очки</h2>
        <p className="text-[10px] text-[#94A3B8] mt-0.5">Текущие результаты</p>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {sortedPlayers.map((p, index) => {
            const playerScore = Number(scores[p.id]) || 0;
            const isLeader = playerScore === maxScore && maxScore > 0;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-md transition-all ${
                  isLeader
                    ? "bg-[#FEF9C3] border border-[#FDE047]"
                    : "bg-[#F8FAFC] border border-[#E2E8F0]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? "bg-[#FBBF24]" :
                      index === 1 ? "bg-[#94A3B8]" :
                      index === 2 ? "bg-[#B45309]" :
                      "bg-[#3B82F6]"
                    }`}>
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    {isLeader && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FBBF24] rounded-full flex items-center justify-center text-[8px]">
                        👑
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#1E293B]">{getPlayerName(p.id)}</span>
                    {isLeader && (
                      <span className="text-[8px] text-[#B45309] block">Лидер</span>
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

        <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex justify-between items-center">
          <span className="text-[10px] text-[#64748B]">Всего: {sortedPlayers.length}</span>
          <button
            className="text-[#EF4444] hover:text-[#DC2626] text-xs font-medium transition-colors"
            onClick={onEndGame}
          >
            Закончить игру
          </button>
        </div>
      </div>
    </div>
  );
};