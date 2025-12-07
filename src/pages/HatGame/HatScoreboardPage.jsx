// import React, { useMemo } from "react";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";

// export const HatScoreboardPage = ({
//   players,
//   scores,
//   onEndGame,
//   getPlayerName,
// }) => {
//   // Сортируем игроков по очкам по убыванию, приводим к числу
//   const sortedPlayers = useMemo(() => {
//     return [...players].sort((a, b) => {
//       const scoreB = Number(scores[b.id]) || 0;
//       const scoreA = Number(scores[a.id]) || 0;
//       return scoreB - scoreA;
//     });
//   }, [players, scores]);

//   // Лог для проверки
//   console.log("[HatScoreboardPage] Sorted scores:", sortedPlayers.map(p => ({
//     name: getPlayerName(p.id),
//     score: Number(scores[p.id]) || 0
//   })));

//   // Находим максимальный счет
//   const maxScore = Math.max(...Object.values(scores).map(s => Number(s) || 0));

//   return (
//     <section className="flex flex-col items-start gap-6 w-full">
//       <Card className="w-full rounded-xl border shadow-[0px_1px_2px_#0000000d]">
//         <CardContent className="p-[25px] flex flex-col gap-5">
//           <h2 className="text-2xl font-bold text-center text-ebony mb-2">
//             Победные очки
//           </h2>

//           <div className="flex flex-col gap-2">
//             {sortedPlayers.map((p) => {
//               const isLeader = (Number(scores[p.id]) || 0) === maxScore;
//               return (
//                 <div
//                   key={p.id}
//                   className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 ${
//                     isLeader ? "bg-yellow-100 border border-yellow-300" : ""
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <Avatar>
//                       <AvatarFallback>{p.name[0].toUpperCase()}</AvatarFallback>
//                     </Avatar>
//                     <span className="font-semibold text-ebony-clay">
//                       {p.name}
//                     </span>
//                   </div>
//                   <span className="text-lg font-bold text-royal-blue">
//                     {Number(scores[p.id]) || 0}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </CardContent>
//       </Card>

//       <div className="flex justify-end w-full pt-2">
//         <Button
//           variant="ghost"
//           className="text-red-600 hover:text-red-700"
//           onClick={onEndGame}
//         >
//           Закончить игру
//         </Button>
//       </div>
//     </section>
//   );
// };



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
  // Сортируем игроков по очкам по убыванию, при равных - по имени
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const scoreB = Number(scores[b.id]) || 0;
      const scoreA = Number(scores[a.id]) || 0;
      
      // Сначала по очкам (по убыванию)
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      
      // При равных очках - по имени (алфавитно)
      const nameA = getPlayerName(a.id) || '';
      const nameB = getPlayerName(b.id) || '';
      return nameA.localeCompare(nameB);
    });
  }, [players, scores, getPlayerName]);

  // Находим максимальный счет
  const maxScore = useMemo(() => {
    const values = Object.values(scores).map(s => Number(s) || 0);
    return Math.max(...values);
  }, [scores]);

  // Лог для проверки
  console.log("[HatScoreboardPage] Sorted players with scores:", 
    sortedPlayers.map(p => ({
      name: getPlayerName(p.id),
      score: Number(scores[p.id]) || 0,
      isLeader: (Number(scores[p.id]) || 0) === maxScore
    }))
  );

  return (
    <section className="flex flex-col items-start gap-6 w-full">
      <Card className="w-full rounded-xl border shadow-[0px_1px_2px_#0000000d]">
        <CardContent className="p-[25px] flex flex-col gap-5">
          <h2 className="text-2xl font-bold text-center text-ebony mb-2">
            Победные очки
          </h2>

          <div className="flex flex-col gap-2">
            {sortedPlayers.map((p, index) => {
              const playerScore = Number(scores[p.id]) || 0;
              const isLeader = playerScore === maxScore && maxScore > 0;
              
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 ${
                    isLeader ? "bg-yellow-100 border border-yellow-300" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {index + 1} {/* Показываем место */}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-ebony-clay">
                        {getPlayerName(p.id)}
                      </span>
                      {isLeader && (
                        <span className="text-xs text-yellow-700 font-medium">
                          🏆 Лидер
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-royal-blue">
                      {playerScore}
                    </span>
                    <span className="text-xs text-gray-500">
                      {playerScore === maxScore && "1 место"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end w-full pt-2">
        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700"
          onClick={onEndGame}
        >
          Закончить игру
        </Button>
      </div>
    </section>
  );
};