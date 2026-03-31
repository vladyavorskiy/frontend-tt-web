import React, { useState } from "react";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowRightIcon, 
  CloseIcon 
} from "../../components/GameIcons";

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
    <div className="flex-1 flex items-center justify-center px-4 md:px-8 lg:px-[122px] py-8 overflow-auto">
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full max-w-[1200px]">
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden min-w-0">
          <div className="px-6 py-5">
            <h2 className="text-xl font-semibold text-black leading-7">Создание пар</h2>
            <p className="text-sm text-gray-600 mt-1 leading-5">
              Перетаскивайте игроков для создания пар. Участник не может быть в паре с собой.
            </p>
          </div>

          <div className="border-b border-black px-6 pb-2">
            <div className="flex items-center gap-4 py-2">
              <div className="w-6 flex-shrink-0">
                <span className="text-base font-medium text-gray-600">#</span>
              </div>
              <div className="flex-1 flex items-center gap-5 min-w-0">
                <span className="text-base font-medium text-gray-600 w-44">Объясняющий</span>
                <span className="text-base font-medium text-gray-600 flex-1 pl-8">Отгадывающий</span>
              </div>
              <span className="text-base font-medium text-gray-600 w-20 text-right pr-2">Действия</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {pairs.map((pair, index) => (
              <PairRow
                key={pair.explainer.id}
                pair={pair}
                index={index}
                total={pairs.length}
                onRemoveGuesser={removePair}
                onMove={(idx, dir) => {
                  const newPairs = [...pairs];
                  const targetIndex = dir === "up" ? idx - 1 : idx + 1;
                  if (targetIndex < 0 || targetIndex >= newPairs.length) return;
                  [newPairs[idx], newPairs[targetIndex]] = [newPairs[targetIndex], newPairs[idx]];
                  setPairs(newPairs);
                }}
                onDrop={handleDropOnSlot}
              />
            ))}

            {availableExplainers.map((explainer) => (
              <EmptyPairRow
                key={explainer.id}
                explainer={explainer}
                onDrop={handleDropOnSlot}
              />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-72 flex flex-col gap-3 flex-shrink-0">
          <button
            onClick={handleShuffle}
            className="w-full py-3 px-5 border border-gray-300 bg-white rounded-lg text-sm font-semibold text-gray-700 uppercase tracking-wide hover:bg-gray-50 transition-colors"
          >
            Сгенерировать пары
          </button>
          <button
            onClick={onConfirmPairs}
            disabled={!allPlayersDistributed}
            className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white uppercase tracking-wide transition-colors"
          >
            Подтвердить пары ({pairs.length}/{players.length})
          </button>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-base font-semibold text-black mb-1">Все участники</h3>
            <p className="text-xs text-gray-500 mb-4">Перетащите игрока в столбец отгадывающих</p>

            <div className="grid grid-cols-3 gap-3">
              {availableGuessers.map((player) => (
                <ParticipantCard
                  key={player.id}
                  player={player}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>

            {availableGuessers.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">Все игроки в парах</p>
            )}
          </div>

          <button
            onClick={onEndGame}
            className="w-full py-3 px-5 border border-gray-300 bg-white rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Закончить игру
          </button>
        </div>
      </div>
    </div>
  );
}

function PairRow({ pair, index, total, onRemoveGuesser, onMove, onDrop }) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="w-6 flex-shrink-0 text-gray-500 font-medium text-sm">{index + 1}</div>

      <div className="flex items-center gap-2 w-40 flex-shrink-0">
        <Avatar letter={pair.explainer.name.charAt(0).toUpperCase()} color="blue" />
        <span className="text-sm font-medium text-black truncate">{pair.explainer.name}</span>
      </div>

      <div className="text-gray-400 flex-shrink-0">
        <ArrowRightIcon width={16} height={16} color="#9CA3AF" />
      </div>

      <div
        className={`flex-1 min-w-0 flex items-center gap-2 rounded-lg border-2 border-dashed px-3 py-2 min-h-[44px] transition-colors ${
          isDragOver ? "border-blue-400 bg-blue-50" : pair.guesser ? "border-gray-300 bg-white" : "border-gray-300 bg-white"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={() => { setIsDragOver(false); onDrop(pair.explainer.id); }}
      >
        {pair.guesser ? (
          <>
            <Avatar letter={pair.guesser.name.charAt(0).toUpperCase()} color="green" />
            <span className="text-sm font-medium text-black truncate">{pair.guesser.name}</span>
          </>
        ) : (
          <span className="text-sm text-gray-400">Перетащите</span>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onMove(index, "up")}
            disabled={index === 0}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-0.5"
          >
            <ArrowUpIcon width={14} height={14} color="currentColor" />
          </button>
          <button
            onClick={() => onMove(index, "down")}
            disabled={index === total - 1}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-0.5"
          >
            <ArrowDownIcon width={14} height={14} color="currentColor" />
          </button>
        </div>

        {pair.guesser && (
          <button
            onClick={() => onRemoveGuesser(pair.explainer.id)}
            className="ml-1 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors flex-shrink-0"
          >
            <CloseIcon width={10} height={10} color="white" />
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyPairRow({ explainer, onDrop }) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div className="flex items-center gap-4 px-6 py-4 bg-gray-50">
      <div className="w-6 flex-shrink-0 text-gray-400 text-sm">?</div>
      <div className="flex items-center gap-2 w-40 flex-shrink-0">
        <Avatar letter={explainer.name.charAt(0).toUpperCase()} color="blue" />
        <span className="text-sm font-medium text-black truncate">{explainer.name}</span>
      </div>
      <div className="text-gray-400 flex-shrink-0">
        <ArrowRightIcon width={16} height={16} color="#9CA3AF" />
      </div>
      <div
        className={`flex-1 min-w-0 rounded-lg border-2 border-dashed px-3 py-2 min-h-[44px] transition-colors ${
          isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={() => { setIsDragOver(false); onDrop(explainer.id); }}
      >
        <span className="text-sm text-gray-400">Перетащите сюда</span>
      </div>
      <div className="w-20" />
    </div>
  );
}

function ParticipantCard({ player, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(player)}
      onDragEnd={() => {}}
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-4 px-2 cursor-grab active:cursor-grabbing select-none hover:shadow-md transition-shadow"
    >
      <Avatar letter={player.name.charAt(0).toUpperCase()} color="green" size="md" />
      <span className="text-xs text-center text-black font-normal leading-4 truncate w-full">{player.name}</span>
    </div>
  );
}

function Avatar({ letter, color = "blue", size = "sm" }) {
  const sizeClass = size === "md" ? "w-10 h-10 text-base" : "w-8 h-8 text-sm";
  const bgColor = color === "blue" 
    ? "bg-gradient-to-br from-blue-500 to-blue-700" 
    : "bg-gradient-to-br from-green-500 to-green-700";
  
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${bgColor}`}>
      {letter}
    </div>
  );
}