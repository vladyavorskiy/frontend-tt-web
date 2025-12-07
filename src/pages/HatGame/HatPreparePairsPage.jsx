import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShuffleIcon, GripVerticalIcon } from "lucide-react";

export default function HatPreparePairsPage({ 
  players, 
  pairs, 
  setPairs, 
  socket, 
  onConfirmPairs,
  getPlayerName,
  onEndGame,
  showToast 
}) {
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [draggedPairIndex, setDraggedPairIndex] = useState(null);

  const getAvailableExplainerSlots = () => {
    const usedAsExplainer = new Set(pairs.map(pair => pair.explainer.id));
    return players.filter(player => !usedAsExplainer.has(player.id));
  };

  const getAvailableGuesserPlayers = () => {
    const usedAsGuesser = new Set(pairs.map(pair => pair.guesser.id));
    return players.filter(player => !usedAsGuesser.has(player.id));
  };

  const handleDragStart = (player) => {
    const availableGuessers = getAvailableGuesserPlayers();
    if (availableGuessers.some(p => p.id === player.id)) {
      setDraggedPlayer(player);
    }
  };

  const handlePairDragStart = (index) => setDraggedPairIndex(index);
  const handlePairDragOver = (e, index) => e.preventDefault();
  const handlePairDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedPairIndex === null || draggedPairIndex === targetIndex) return;

    const newPairs = [...pairs];
    const [movedPair] = newPairs.splice(draggedPairIndex, 1);
    newPairs.splice(targetIndex, 0, movedPair);
    
    setPairs(newPairs);
    setDraggedPairIndex(null);
    console.log("[HatPreparePairsPage] Pairs reordered:", newPairs);
  };

  const handleDropOnSlot = (explainerId) => {
    if (!draggedPlayer) return;

    if (draggedPlayer.id === explainerId) {
      showToast('error', "Нельзя создать пару с самим собой!");
      return;
    }

    const explainerAlreadyUsed = pairs.some(pair => pair.explainer.id === explainerId);
    if (explainerAlreadyUsed) {
      showToast('error', "Этот игрок уже является объясняющим в другой паре!");
      return;
    }

    const guesserAlreadyUsed = pairs.some(pair => pair.guesser.id === draggedPlayer.id);
    if (guesserAlreadyUsed) {
      showToast('error', "Этот игрок уже является отгадывающим в другой паре!");
      return;
    }

    const explainer = players.find((p) => p.id === explainerId);
    const newPair = { 
      explainer: { id: explainer.id, name: explainer.name }, 
      guesser: { id: draggedPlayer.id, name: draggedPlayer.name } 
    };
    
    setPairs((prev) => {
      const updatedPairs = [...prev, newPair];
      console.log("[HatPreparePairsPage] Pair created:", newPair);
      return updatedPairs;
    });
    setDraggedPlayer(null);
  };

  const handleShuffle = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const newPairs = [];
    
    for (let i = 0; i < shuffled.length; i++) {
      const explainer = shuffled[i];
      const guesser = shuffled[(i + 1) % shuffled.length];
      newPairs.push({ 
        explainer: { id: explainer.id, name: explainer.name }, 
        guesser: { id: guesser.id, name: guesser.name } 
      });
    }
    
    setPairs(newPairs);
    console.log("[HatPreparePairsPage] Pairs shuffled:", newPairs);
  };

  const removePair = (explainerId) => {
    setPairs(prev => {
      const updated = prev.filter(pair => pair.explainer.id !== explainerId);
      console.log("[HatPreparePairsPage] Pair removed:", explainerId, updated);
      return updated;
    });
  };

  const allPlayersDistributed = pairs.length === players.length;
  const availableExplainers = getAvailableExplainerSlots();
  const availableGuessers = getAvailableGuesserPlayers();

  return (
    <div className="flex flex-col w-full items-start bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <header className="w-full text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Создание пар</h2>
        <p className="text-gray-500 text-sm">
          Создавайте пары отгадывающий - объясняющий. Меняйте порядок пар.
        </p>
      </header>

      {/* Таблица пар */}
      <Card className="p-4 w-full mb-6">
        <CardContent>
          <div className="grid grid-cols-[auto_1fr_1fr_auto] border-b pb-2 font-semibold text-gray-700">
            <div className="w-8">#</div>
            <div>Объясняющий</div>
            <div>Отгадывающий</div>
            <div className="w-12">Action</div>
          </div>

          {pairs.map((pair, index) => (
            <div
              key={pair.explainer.id}
              className="grid grid-cols-[auto_1fr_1fr_auto] items-center py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              draggable
              onDragStart={() => handlePairDragStart(index)}
              onDragOver={(e) => handlePairDragOver(e, index)}
              onDrop={(e) => handlePairDrop(e, index)}
              onDragEnd={() => setDraggedPairIndex(null)}
            >
              <div className="flex items-center gap-1 w-8">
                <GripVerticalIcon className="w-4 h-4 text-gray-400 cursor-grab" />
                <span className="text-sm text-gray-500">{index + 1}</span>
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {pair.explainer.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{pair.explainer.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-green-100 text-green-800">
                    {pair.guesser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{pair.guesser.name}</span>
              </div>

              <div className="flex justify-end w-12">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePair(pair.explainer.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}

          {availableExplainers.map((explainer) => {
            const existingPair = pairs.find((p) => p.explainer.id === explainer.id);
            return (
              <div
                key={explainer.id}
                className="grid grid-cols-[auto_1fr_1fr_auto] items-center py-2 border-b border-gray-100"
              >
                <div className="w-8"></div>

                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      {explainer.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{explainer.name}</span>
                </div>

                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-2 text-center text-gray-400 hover:bg-blue-50 transition min-h-[60px] flex items-center justify-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnSlot(explainer.id)}
                >
                  {existingPair ? (
                    <div className="flex justify-between items-center gap-2 text-gray-800 w-full">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-green-100 text-green-800">
                            {existingPair.guesser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{existingPair.guesser.name}</span>
                      </div>
                    </div>
                  ) : (
                    <span>Перетащите угадывающего сюда</span>
                  )}
                </div>

                <div className="w-12"></div>
              </div>
            );
          })}

          {availableExplainers.length === 0 && pairs.length > 0 && (
            <div className="text-center py-4 text-green-600 font-semibold col-span-4">
              Все игроки распределены
            </div>
          )}
        </CardContent>
      </Card>

      {availableGuessers.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-2">Доступные отгадывающие</h3>
          <p className="text-gray-500 text-sm mb-2">Перетащите игрока в строку объясняющего</p>
          <div className="flex flex-wrap gap-3 p-4 bg-green-50 rounded-lg border border-gray-200 mb-6 w-full">
            {availableGuessers.map((player) => (
              <div
                key={player.id}
                draggable
                onDragStart={() => handleDragStart(player)}
                onDragEnd={() => setDraggedPlayer(null)}
                className="flex flex-col items-center p-3 w-[120px] bg-white cursor-grab active:scale-95 transition border rounded-lg shadow-sm"
              >
                <Avatar className="w-12 h-12 mb-2">
                  <AvatarFallback className="bg-green-100 text-green-800">
                    {player.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-800 text-center">{player.name}</span>
                <span className="text-xs text-green-600 mt-1">Отгадывающий</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-center gap-3 w-full">
        <Button
          variant="secondary"
          onClick={handleShuffle}
          className="flex gap-2 bg-blue-100 text-blue-700"
        >
          <ShuffleIcon className="w-4 h-4" />
          Сгенерировать пары
        </Button>

        <Button
          disabled={!allPlayersDistributed}
          onClick={() => {
            onConfirmPairs();
            console.log("[HatPreparePairsPage] Pairs confirmed:", pairs);
          }}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Подтвердить пары ({pairs.length}/{players.length})
        </Button>
      </div>

      {!allPlayersDistributed && (
        <div className="w-full text-center mt-2">
          <p className="text-orange-600 text-sm">
            {pairs.length} из {players.length} пар создано
          </p>
          <p className="text-orange-600 text-xs">
            Каждый участник должен быть ровно один раз объясняющим и отгадывающим 
          </p>
        </div>
      )}

      <div className="mt-6 text-right w-full">
        <button
          onClick={() => {
            onEndGame();
            console.log("[HatPreparePairsPage] Game ended early by user");
          }}
          className="text-red-600 text-sm hover:underline"
        >
          Закончить игру
        </button>
      </div>
    </div>
  );
}
