import React, { useMemo } from "react";
import { TrophyIcon } from "../../components/GameIcons";

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
    return Math.max(...values, 0);
  }, [scores]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-black">Победные очки</h2>
        <p className="text-xs text-gray-500 mt-0.5">Текущие результаты</p>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {sortedPlayers.map((p, index) => {
            const playerScore = Number(scores[p.id]) || 0;
            const isLeader = playerScore === maxScore && maxScore > 0;
            const rank = index + 1;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isLeader
                    ? "border border-yellow-400 bg-yellow-50"
                    : "border border-gray-100 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RankBadge rank={rank} isLeader={isLeader} />
                  <Avatar letter={getPlayerName(p.id).charAt(0).toUpperCase()} />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{getPlayerName(p.id)}</span>
                    {isLeader && (
                      <span className="text-[10px] text-amber-600 block">Лидер</span>
                    )}
                  </div>
                </div>
                <div className="px-3 py-1 bg-blue-500 rounded-full">
                  <span className="text-sm font-bold text-white">{playerScore}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500">Всего: {sortedPlayers.length}</span>
          <button
            className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
            onClick={onEndGame}
          >
            Закончить игру
          </button>
        </div>
      </div>
    </div>
  );
};

function RankBadge({ rank, isLeader }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
        <TrophyIcon width={16} height={16} color="white" />
      </div>
    );
  }
  
  let bgColor = "bg-blue-500";
  if (rank === 2) bgColor = "bg-gray-400";
  if (rank === 3) bgColor = "bg-amber-600";
  
  return (
    <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold text-sm">{rank}</span>
    </div>
  );
}

function Avatar({ letter }) {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
      <span className="text-white text-sm font-semibold">{letter}</span>
    </div>
  );
}