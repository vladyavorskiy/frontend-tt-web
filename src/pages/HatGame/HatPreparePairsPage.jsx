import React, { useState } from "react";

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
    
    setPairs((prev) => [...prev, newPair]);
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
  };

  const removePair = (explainerId) => {
    setPairs(prev => prev.filter(pair => pair.explainer.id !== explainerId));
  };

  const allPlayersDistributed = pairs.length === players.length;
  const availableExplainers = getAvailableExplainerSlots();
  const availableGuessers = getAvailableGuesserPlayers();

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Левая колонка - пары */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="bg-[#1E293B] px-4 py-3">
                <h2 className="text-sm font-semibold text-white">Создание пар</h2>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">Перетаскивайте игроков для создания пар</p>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-12 gap-3 mb-3 px-2 text-[10px] font-medium text-[#64748B]">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Объясняющий</div>
                  <div className="col-span-5">Отгадывающий</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-2">
                  {pairs.map((pair, index) => (
                    <div
                      key={pair.explainer.id}
                      className="grid grid-cols-12 gap-3 items-center p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md cursor-move hover:bg-[#F1F5F9] transition-colors"
                      draggable
                      onDragStart={() => handlePairDragStart(index)}
                      onDragOver={(e) => handlePairDragOver(e, index)}
                      onDrop={(e) => handlePairDrop(e, index)}
                      onDragEnd={() => setDraggedPairIndex(null)}
                    >
                      <div className="col-span-1 flex items-center gap-1">
                        <span className="text-[10px] text-[#64748B]">⋮⋮</span>
                        <span className="text-xs font-medium text-[#1E293B]">{index + 1}</span>
                      </div>

                      <div className="col-span-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#3B82F6] rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-medium text-white">
                              {pair.explainer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-[#1E293B]">{pair.explainer.name}</span>
                        </div>
                      </div>

                      <div className="col-span-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-medium text-white">
                              {pair.guesser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-[#1E293B]">{pair.guesser.name}</span>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <button
                          onClick={() => removePair(pair.explainer.id)}
                          className="w-5 h-5 text-[#EF4444] hover:text-[#DC2626] text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {availableExplainers.map((explainer) => (
                    <div
                      key={explainer.id}
                      className="grid grid-cols-12 gap-3 items-center p-2 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-md"
                    >
                      <div className="col-span-1">
                        <span className="text-[10px] text-[#94A3B8]">?</span>
                      </div>

                      <div className="col-span-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#3B82F6] rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-medium text-white">
                              {explainer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-[#1E293B]">{explainer.name}</span>
                        </div>
                      </div>

                      <div
                        className="col-span-5"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropOnSlot(explainer.id)}
                      >
                        <div className="h-8 border border-dashed border-[#CBD5E1] rounded bg-[#F8FAFC] flex items-center justify-center">
                          <span className="text-[8px] text-[#64748B]">Перетащите сюда</span>
                        </div>
                      </div>

                      <div className="col-span-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка - управление */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-4">
              <button
                onClick={handleShuffle}
                className="w-full h-8 bg-[#F8FAFC] border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#1E293B] text-xs font-medium rounded-md transition-colors mb-3"
              >
                Сгенерировать пары
              </button>

              <button
                disabled={!allPlayersDistributed}
                onClick={onConfirmPairs}
                className="w-full h-8 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Подтвердить пары ({pairs.length}/{players.length})
              </button>
            </div>

            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-4">
              <h3 className="text-xs font-semibold text-[#1E293B] mb-3">Доступные отгадывающие</h3>
              <p className="text-[10px] text-[#64748B] mb-3">Перетащите игрока в пару</p>

              <div className="grid grid-cols-2 gap-2">
                {availableGuessers.map((player) => (
                  <div
                    key={player.id}
                    draggable
                    onDragStart={() => handleDragStart(player)}
                    onDragEnd={() => setDraggedPlayer(null)}
                    className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md cursor-grab active:cursor-grabbing hover:bg-[#F1F5F9] transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center mb-1">
                        <span className="text-xs font-medium text-white">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-[#1E293B] text-center truncate w-full">
                        {player.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {availableGuessers.length === 0 && (
                <p className="text-[10px] text-[#64748B] text-center py-2">Все игроки в парах</p>
              )}
            </div>

            <div className="text-right">
              <button
                onClick={onEndGame}
                className="text-[#EF4444] hover:text-[#DC2626] text-xs font-medium transition-colors"
              >
                Закончить игру
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}