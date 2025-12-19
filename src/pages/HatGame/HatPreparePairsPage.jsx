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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              Создание пар
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Создавайте пары "объясняющий → отгадывающий". Перетаскивайте игроков.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="w-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl font-semibold text-gray-700 dark:text-gray-300">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Объясняющий</div>
                    <div className="col-span-5">Отгадывающий</div>
                    <div className="col-span-1"></div>
                  </div>

                  {pairs.map((pair, index) => (
                    <div
                      key={pair.explainer.id}
                      className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-move"
                      draggable
                      onDragStart={() => handlePairDragStart(index)}
                      onDragOver={(e) => handlePairDragOver(e, index)}
                      onDrop={(e) => handlePairDrop(e, index)}
                      onDragEnd={() => setDraggedPairIndex(null)}
                    >
                      <div className="col-span-1 flex items-center gap-2">
                        <GripVerticalIcon className="w-5 h-5 text-gray-400 cursor-grab" />
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                      </div>

                      <div className="col-span-5">
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                          <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-700">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {pair.explainer.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-gray-800 dark:text-white">{pair.explainer.name}</span>
                        </div>
                      </div>

                      <div className="col-span-5">
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                          <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-700">
                            <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                              {pair.guesser.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-gray-800 dark:text-white">{pair.guesser.name}</span>
                        </div>
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePair(pair.explainer.id)}
                          className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
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
                        className="grid grid-cols-12 gap-4 items-center p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
                      >
                        <div className="col-span-1">
                          <span className="text-gray-400">?</span>
                        </div>

                        <div className="col-span-5">
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                            <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-700">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {explainer.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-gray-800 dark:text-white">{explainer.name}</span>
                          </div>
                        </div>

                        <div
                          className="col-span-5"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDropOnSlot(explainer.id)}
                        >
                          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-dashed border-green-300 dark:border-green-700 hover:border-green-500 dark:hover:border-green-500 transition-all min-h-[56px] flex items-center justify-center">
                            {existingPair ? (
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                    {existingPair.guesser.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-gray-800 dark:text-white">
                                  {existingPair.guesser.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-center">
                                Перетащите отгадывающего сюда
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-1"></div>
                      </div>
                    );
                  })}
                </div>

                {availableExplainers.length === 0 && pairs.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <p className="text-center font-bold text-green-600 dark:text-green-400">
                      Все игроки распределены!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-xl">
              <CardContent className="p-6 space-y-4">
                <Button
                  variant="outline"
                  onClick={handleShuffle}
                  className="w-full h-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl font-semibold"
                >
                  <ShuffleIcon className="w-5 h-5 mr-2" />
                  Сгенерировать пары
                </Button>

                <Button
                  disabled={!allPlayersDistributed}
                  onClick={() => {
                    onConfirmPairs();
                    console.log("[HatPreparePairsPage] Pairs confirmed:", pairs);
                  }}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Подтвердить пары ({pairs.length}/{players.length})
                </Button>

                
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  Доступные отгадывающие
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Перетащите игрока в пару к объясняющему
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {availableGuessers.map((player) => (
                    <div
                      key={player.id}
                      draggable
                      onDragStart={() => handleDragStart(player)}
                      onDragEnd={() => setDraggedPlayer(null)}
                      className="cursor-grab active:cursor-grabbing transform active:scale-95 transition-all"
                    >
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-green-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-lg transition-all">
                        <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-white dark:border-gray-700">
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            {player.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white text-center truncate">
                          {player.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 text-center mt-1">
                          Отгадывающий
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {availableGuessers.length === 0 && (
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mt-4">
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Все игроки уже в парах
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => {
                  onEndGame();
                  console.log("[HatPreparePairsPage] Game ended early by user");
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Закончить игру
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}