import React, { useMemo } from "react";
import { TrophyIcon, TrophyLargeIcon } from "../../components/GameIcons";

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

  const handlePlayAgain = () => {
    navigate('/');
  };

  const handleReturnToRoom = () => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="flex-1 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col items-center justify-center gap-3 px-8 py-8 bg-gradient-to-r from-yellow-400 to-yellow-500">
            <div className="flex items-center justify-center">
              <TrophyLargeIcon width={48} height={48} color="white" />
            </div>
            <h1 className="text-white font-bold text-3xl leading-9 text-center">
              Игра завершена!
            </h1>
            <p className="text-white/90 text-sm">Итоговые результаты</p>
          </div>

          <div className="p-6">
            {mode === "solo" ? (
              <div className="space-y-3">
                {sortedPlayers.map((p, index) => {
                  const playerScore = Number(scores[p.id]) || 0;
                  const isWinner = winners.includes(p.id);
                  const rank = index + 1;

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        isWinner
                          ? "border border-yellow-400 bg-yellow-50"
                          : "border border-gray-100 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <RankBadge rank={rank} isWinner={isWinner} />
                        <Avatar letter={getPlayerName(p.id).charAt(0).toUpperCase()} size="lg" />
                        <div>
                          <span className="text-base font-medium text-gray-900">
                            {p.name || getPlayerName(p.id)}
                          </span>
                          {isWinner && (
                            <span className="text-[10px] text-amber-600 block">Победитель</span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-1.5 bg-blue-500 rounded-full">
                        <span className="text-base font-bold text-white">{playerScore}</span>
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
                      className={`rounded-lg overflow-hidden ${
                        isWinner ? "border-2 border-yellow-400" : "border border-gray-200"
                      }`}
                    >
                      <div className={`px-4 py-3 ${isWinner ? "bg-yellow-50" : "bg-gray-50"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{idx + 1}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              Команда {idx + 1}
                            </h3>
                          </div>
                          <div className="px-3 py-1 bg-green-500 rounded">
                            <span className="text-xs font-bold text-white">{teamScore}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4">
                        {team.map((id, playerIndex) => (
                          <div key={id} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-5">{playerIndex + 1}</span>
                              <span className="text-sm text-gray-700">{getPlayerName(id)}</span>
                            </div>
                            <span className="text-sm font-medium text-blue-600">
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

            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-semibold text-sm tracking-wider uppercase hover:bg-gray-50 transition-colors"
                onClick={handlePlayAgain}
              >
                Играть ещё
              </button>
              <button
                className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm tracking-wider uppercase transition-colors"
                onClick={handleReturnToRoom}
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

function RankBadge({ rank, isWinner }) {
  if (rank === 1) {
    return (
      <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
        <TrophyIcon width={20} height={20} color="white" />
      </div>
    );
  }
  
  let bgColor = "bg-blue-500";
  if (rank === 2) bgColor = "bg-gray-400";
  if (rank === 3) bgColor = "bg-amber-600";
  
  return (
    <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold text-base">{rank}</span>
    </div>
  );
}

function Avatar({ letter, size = "lg" }) {
  const sizeClass = size === "lg" ? "w-12 h-12 text-lg" : "w-8 h-8 text-sm";
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold">{letter}</span>
    </div>
  );
}