import React from "react";
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
  let winners = [];

  if (mode === "solo") {
    const maxScore = Math.max(...Object.values(scores));
    winners = Object.entries(scores)
      .filter(([id, score]) => score === maxScore)
      .map(([id]) => Number(id));
  } else if (mode === "team") {
    const teamScores = teams.map((team) =>
      team.reduce((sum, id) => sum + (scores[id] || 0), 0)
    );
    const maxScore = Math.max(...teamScores);
    winners = teams
      .map((team, idx) => (teamScores[idx] === maxScore ? idx : -1))
      .filter((idx) => idx !== -1);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h2 className="text-3xl font-bold text-center mb-4">Игра закончена</h2>

      {mode === "solo" ? (
        <div className="flex flex-col gap-2">
          {players.map((p) => {
            const isWinner = winners.includes(p.id);
            return (
              <Card
                key={p.id}
                className={`p-4 ${
                  isWinner ? "bg-yellow-200 border-2 border-yellow-400" : ""
                }`}
              >
                <CardContent className="flex justify-between items-center">
                  <span className="font-semibold">{p.name}</span>
                  <span className="font-bold">{scores[p.id] || 0}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {teams.map((team, idx) => {
            const isWinner = winners.includes(idx);
            const teamScore = team.reduce((sum, id) => sum + (scores[id] || 0), 0);
            return (
              <Card
                key={idx}
                className={`p-4 flex flex-col gap-2 ${
                  isWinner ? "bg-yellow-200 border-2 border-yellow-400" : ""
                }`}
              >
                <CardContent>
                  <h3 className="font-bold mb-1">Команда: {idx + 1} - Очки: {teamScore} </h3>
                  <ul className="ml-4 list-disc">
                    {team.map((id) => (
                      <li key={id}>
                        {getPlayerName(id)}: {scores[id] || 0}
                      </li>
                    ))}
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
