import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import socket from "@/socketClient";

export const HatScoreboardPage = ({
  players,
  scores,
  onEndGame,
  getPlayerName,
}) => {
  return (
    <section className="flex flex-col items-start gap-6 w-full">
      <Card className="w-full rounded-xl border shadow-[0px_1px_2px_#0000000d]">
        <CardContent className="p-[25px] flex flex-col gap-5">
          <h2 className="text-2xl font-bold text-center text-ebony mb-2">
            Победные очки
          </h2>

          <div className="flex flex-col gap-2">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{p.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-ebony-clay">
                    {p.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-royal-blue">
                  {scores[p.id] || 0}
                </span>
              </div>
            ))}
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
