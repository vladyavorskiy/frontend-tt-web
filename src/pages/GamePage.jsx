import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from 'react-router-dom';

export default function GamePage({ socket, userId, isCreator: isCreatorProp }) {
  const [gamePhase, setGamePhase] = useState("setup");
  const [type, setType] = useState("online");
  const [mode, setMode] = useState("solo");
  const [roundTime, setRoundTime] = useState([10, 12, 5]);
  const [wordsPerPlayer, setWordsPerPlayer] = useState(1);

  const navigate = useNavigate();
  const { id: roomId } = useParams();
  
  const [userWords, setUserWords] = useState([]);
  const [waitingStatus, setWaitingStatus] = useState({ submitted: 0, total: 0 });
  const [currentWord, setCurrentWord] = useState(null);
  const [activePlayer, setActivePlayer] = useState(null);
  const [guesser, setGuesser] = useState(null);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(0);
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false); 
  const [pairs, setPairs] = useState([]);
  const [teams, setTeams] = useState([[], []]);
  const [scores, setScores] = useState({});
  const [selectedExplainer, setSelectedExplainer] = useState(null);
  const [selectedGuesser, setSelectedGuesser] = useState(null);

  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    setIsCreator(!!isCreatorProp);
  }, [isCreatorProp]);

  const timerRef = useRef(null);

  const isCurrentExplainer = activePlayer === userId;


  useEffect(() => {
    if (!socket) return;
    try {
      socket.emit('check_role', { roomId, userId });
    } catch (e) {
      console.warn('check_role emit failed', e);
    }

    const onRoleInfo = (data) => {
      console.log('[GamePage] role_info:', data);
    };
    socket.on('role_info', onRoleInfo);

    return () => {
      socket.off('role_info', onRoleInfo);
    };
  }, [socket, roomId, userId]);

  const startTimerLocal = (seconds) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer(seconds);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          if (socket) socket.emit("end_turn");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimerLocal = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer(0);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("players_list", (list) => {
      setPlayers(list || []);
    });

    socket.on("phase_changed", (data) => {
      const {
        phase,
        round: newRound,
        type: newType,
        mode: newMode,
        roundTime: newRoundTime,
        wordsPerPlayer: newWPP,
        participants,
        scores: newScores,
        currentWord: cw,
        activePlayerId,
        guesserId,
        waitingStatus
      } = data;

      if (phase) setGamePhase(phase);
      if (newType) setType(newType);
      if (newMode) setMode(newMode);
      if (Array.isArray(newRoundTime)) setRoundTime(newRoundTime);
      if (typeof newWPP === "number") setWordsPerPlayer(newWPP);
      if (participants) setPlayers(participants);
      if (newScores) setScores(newScores);
      if (activePlayerId !== undefined) setActivePlayer(activePlayerId);
      if (guesserId !== undefined) setGuesser(guesserId);
      if (waitingStatus) setWaitingStatus(waitingStatus);
      if (cw !== undefined) {
        setCurrentWord(cw);
      } else {
        setCurrentWord(null);
      }
      if (newRound !== undefined) {
        setRound(newRound);

        if (phase === "prepare_round") {
          setPairs([]);
          setSelectedExplainer(null);
          setSelectedGuesser(null);
        }
      }
      setIsReady(false);
      stopTimerLocal();
    });

    socket.on("reveal_word", ({ word }) => {
      console.log(word);
      setCurrentWord(word || null);
    });

    socket.on("waiting_for_players", ({ submitted, total }) => {
      setWaitingStatus((prev) => ({
          submitted: submitted ?? prev.submitted,
          total: total ?? prev.total,
        }));
    });

    socket.on("next_word", ({ word, scores: newScores }) => {
      if (newScores) setScores(newScores);
      console.log(word);
      if (word !== undefined) {
        if (isCurrentExplainer) {
          setCurrentWord(word);
        } else {
          setCurrentWord(null);
        }
      }
    });

    socket.on("turn_changed", ({ activePlayerId, guesserId, word, round: newRound, scores: newScores }) => {
      setActivePlayer(activePlayerId);
      setGuesser(guesserId);
      setRound(newRound !== undefined ? newRound : (r => r));
      if (newScores) setScores(newScores);
      console.log(activePlayerId);
      setCurrentWord(null);
      setIsReady(false);
      stopTimerLocal();
    });

    socket.on("start_timer", ({ duration, timeLeft }) => {
      const secs = typeof timeLeft === "number" ? timeLeft : duration;
      startTimerLocal(secs);
    });

    socket.on("update_timer", ({ timeLeft }) => {
      if (typeof timeLeft === "number") setTimer(timeLeft);
    });

    socket.on("turn_time_up", () => {
      setIsReady(false);
      setCurrentWord(null);
      stopTimerLocal();
    });

    return () => {
      socket.off("players_list");
      socket.off("phase_changed");
      socket.off("reveal_word");
      socket.off("waiting_for_players");
      socket.off("next_word");
      socket.off("turn_changed");
      socket.off("start_timer");
      socket.off("update_timer");
      socket.off("turn_time_up");
    };
  }, [socket, isCurrentExplainer]);

  useEffect(() => {
    if (gamePhase === "enterWords") {
      setUserWords(Array(wordsPerPlayer).fill(""));}
  }, [gamePhase, wordsPerPlayer]);

  const submitWords = () => {
    if (!Array.isArray(userWords) || userWords.length !== wordsPerPlayer || userWords.some((w) => !w || !w.trim())) {
      return alert("Заполните все слова!");
    }
    socket.emit("submit_words", { words: userWords });
  };

  const handleReady = () => {
    if (!isCurrentExplainer) return;
    setIsReady(true);
    socket.emit("player_ready");
  };

  const markWordGuessed = () => {
    socket.emit("word_guessed");
    setCurrentWord(null);
  };

  const confirmPairs = () => {
    socket.emit("set_pairs", { pairs });
  };

  const confirmTeams = () => {
    socket.emit("set_teams", { teams });
  };

  const endGameEarly = () => {
    if (!window.confirm("Вы уверены, что хотите преждевременно закончить игру?")) return;
    socket.emit("end_game_early");
    setGamePhase("finished");
    stopTimerLocal();
  };

  const getPlayerName = (id) => players.find((p) => p.id === id)?.name || "Неизвестный";

  if (gamePhase === "setup") {
    if (!isCreator) return <p className="p-6">Ожидайте создателя...</p>;
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h2 className="font-bold mb-4">Настройки игры</h2>

        <div className="mb-2">
          <label>Режим игры: </label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="border p-1 rounded">
            <option value="solo">Соло</option>
            <option value="team">Команды</option>
          </select>
        </div>

        <div className="mb-2">
          <label>Тип: </label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="border p-1 rounded">
            <option value="online">Онлайн</option>
            <option value="offline">Офлайн</option>
          </select>
        </div>

        <div className="mb-2">
          <label>Время на раунды (сек): </label>
          <input
            type="text"
            value={roundTime.join(",")}
            onChange={(e) => setRoundTime(e.target.value.split(",").map((n) => Number(n) || 0))}
            className="border p-1 rounded w-full"
          />
        </div>

        <div className="mb-2">
          <label>Слов на игрока: </label>
          <input type="number" value={wordsPerPlayer} onChange={(e) => setWordsPerPlayer(Number(e.target.value) || 1)} className="border p-1 rounded w-full" />
        </div>

        <div className="flex gap-2">
          <button
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
            onClick={() => socket.emit("create_game", { type, mode, roundTime, wordsPerPlayer })}
          >
            Подтвердить и начать
          </button>
          <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded" onClick={() => socket.emit("cancel_create_game")}>
            Отмена
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === "enterWords") {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h2 className="font-bold mb-4">Введите слова</h2>
        {userWords.map((w, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Слово ${i + 1}`}
            value={w}
            onChange={(e) => {
              const arr = [...userWords];
              arr[i] = e.target.value;
              setUserWords(arr);
            }}
            className="block w-full border p-2 rounded mb-2"
          />
        ))}
        <button onClick={submitWords} className="px-4 py-2 bg-green-600 text-white rounded">Отправить</button>
        <p className="mt-2">Ожидание: {waitingStatus.submitted}/{waitingStatus.total || players.length}</p>
      </div>
    );
  }

  if (gamePhase === "prepare_round") {
    if (!isCreator) return <p className="p-6">Ожидайте создателя...</p>;

    return (
      <div className="p-6 max-w-lg mx-auto">
        <h2 className="font-bold mb-4">Подготовка к раунду</h2>

        {mode === "solo" ? (
           <div>
   <h3>Настройте пары:</h3>

   <div className="flex gap-2 mb-2">
    <select
      value={selectedExplainer || ""}
      onChange={e => setSelectedExplainer(Number(e.target.value))}
      className="border p-1 rounded"
    >
      <option value="">Выберите объясняющего</option>
      {players
        .filter(p => !pairs.some(pair => pair.explainer.id === p.id)) 
        .map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
    </select>

    <select
      value={selectedGuesser || ""}
      onChange={e => setSelectedGuesser(Number(e.target.value))}
      className="border p-1 rounded"
    >
      <option value="">Выберите угадывающего</option>
      {players
        .filter(p => p.id !== selectedExplainer && !pairs.some(pair => pair.guesser.id === p.id)) // только по роли угадывающего
        .map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
    </select>

    <button
      onClick={() => {
        if (selectedExplainer && selectedGuesser) {
          setPairs(prev => [...prev, { explainer: { id: selectedExplainer }, guesser: { id: selectedGuesser } }]);
          setSelectedExplainer(null);
          setSelectedGuesser(null);
        }
      }}
      className="px-2 py-1 bg-blue-500 text-white rounded"
    >
      Добавить пару
    </button>
  </div>
            <div className="mb-2">
              <h4>Созданные пары:</h4>
              <ul>
            {pairs.map((pair, idx) => (
              <li key={idx} className="flex items-center gap-2">
                {getPlayerName(pair.explainer.id)} → {getPlayerName(pair.guesser.id)}
                <button onClick={() => setPairs((p) => {
                  if (idx === 0) return p;
                  const newPairs = [...p];
                  [newPairs[idx - 1], newPairs[idx]] = [newPairs[idx], newPairs[idx - 1]];
                  return newPairs;
                })} className="px-1 py-0.5 bg-gray-300 rounded">↑</button>
                <button onClick={() => setPairs((p) => {
                  if (idx === p.length - 1) return p;
                  const newPairs = [...p];
                  [newPairs[idx + 1], newPairs[idx]] = [newPairs[idx], newPairs[idx + 1]];
                  return newPairs;
                })} className="px-1 py-0.5 bg-gray-300 rounded">↓</button>
                <button onClick={() => setPairs((p) => p.filter((_, i) => i !== idx))} className="ml-2 text-red-600">Удалить</button>
              </li>
            ))}
          </ul>
            </div>

            <button onClick={confirmPairs} disabled={pairs.length === 0 || pairs.length < players.length} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
              Подтвердить пары
            </button>
          </div>
        ) : (
          <div>
            <h3>Настройте команды:</h3>
            {[0, 1].map((ti) => (
              <div key={ti} className="mb-3">
                <h4>Команда {ti + 1}</h4>
                <div className="space-y-1">
                  {teams[ti].map((pid) => (
                    <div key={pid} className="flex justify-between items-center">
                      <span>{getPlayerName(pid)}</span>
                      <button onClick={() => setTeams((prev) => { const copy = [...prev]; copy[ti] = copy[ti].filter((id) => id !== pid); return copy; })} className="px-2 py-1 bg-red-500 text-white rounded">-</button>
                    </div>
                  ))}
                </div>
                <select onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!val) return;
                  setTeams((prev) => { const copy = prev.map(arr => [...arr]); copy[ti].push(val); return copy; });
                }} value="" className="border p-1 rounded w-full mt-2">
                  <option value="">Добавить игрока</option>
                  {players.filter((p) => !teams[0].includes(p.id) && !teams[1].includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            ))}
            <button onClick={confirmTeams} disabled={teams[0].length === 0 || teams[1].length === 0} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">Подтвердить команды</button>
          </div>
        )}

        {isCreator && <button onClick={endGameEarly} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">Преждевременно закончить игру</button>}
      </div>
    );
  }

  if (gamePhase === "game") {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h2 className="font-bold mb-2">Раунд {round + 1}</h2>
        <p className="text-lg font-semibold">Время: {timer}s</p>
        <p>Объясняет: <b>{getPlayerName(activePlayer)}</b></p>
        <p>Отгадывает: <b>{mode === "team" ? `Команда ${guesser}` : getPlayerName(guesser)}</b></p>

        <div className="my-4">
          {isCurrentExplainer ? (
            isReady ? (
              currentWord ? (
                <p className="text-2xl font-bold">{currentWord}</p>
              ) : (
                <p className="italic text-gray-500">Ожидаем слово от сервера...</p>
              )
            ) : (
              <button onClick={handleReady} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Готов к ходу</button>
            )
          ) : (
            <p className="italic text-gray-500">Ожидаем, пока {getPlayerName(activePlayer)} объясняет...</p>
          )}
        </div>

        {isCurrentExplainer && isReady && currentWord && (
          <div className="mb-4">
            <button onClick={markWordGuessed} className="px-4 py-2 bg-green-600 text-white rounded">Угадано!</button>
          </div>
        )}

        {isCreator && <button onClick={endGameEarly} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">Преждевременно закончить игру</button>}

        <h3 className="mt-4">Счёт:</h3>
        <ul>
          {Object.entries(scores).length === 0 && <li>Пока нет очков</li>}
          {Object.entries(scores).map(([id, score]) => <li key={id}>{getPlayerName(Number(id))}: {score}</li>)}
        </ul>
      </div>
    );
  }

  if (gamePhase === "finished") {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h2 className="font-bold mb-4">Игра закончена</h2>
        <h3>Счёт:</h3>
        <ul>
          {Object.entries(scores).map(([id, score]) => (
            <li key={id}>{getPlayerName(Number(id))}: {score}</li>
          ))}
        </ul>
        <div className="mt-4">
          <button
            onClick={() => navigate(`/room/${roomId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Вернуться в комнату
          </button>
        </div>
      </div>
    );
  }

  return <p className="p-6">Ожидание игры...</p>;
}







