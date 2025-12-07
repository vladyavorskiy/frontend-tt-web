import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import socket from '../socketClient';

import HatSetupPage from './HatGame/HatSetupPage';
import HatEnterWordsPage from './HatGame/HatEnterWordsPage';
import HatPreparePairsPage from './HatGame/HatPreparePairsPage';
import { HatRoundPage } from './HatGame/HatRoundPage';
import { HatScoreboardPage } from './HatGame/HatScoreboardPage';
import { HatFinishPage } from './HatGame/HatFinishPage';

export default function GamePage() {
  const navigate = useNavigate();
  const { id: roomId } = useParams();
  const location = useLocation();
  const { userId, isCreator } = location.state || {};

  const [gamePhase, setGamePhase] = useState("setup");
  const [type, setType] = useState("online");
  const [mode, setMode] = useState("solo");
  const [roundTime, setRoundTime] = useState([10, 12, 5]);
  const [wordsPerPlayer, setWordsPerPlayer] = useState(1);

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

  const timerRef = useRef(null);
  const isCurrentExplainer = activePlayer === userId;

  const getPlayerName = (id) => players.find((p) => p.id === id)?.name || "Неизвестный";

  // ---- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----
  const handleReady = () => { 
    if (!isCurrentExplainer) return; 
    setIsReady(true); 
    socket.emit("player_ready");
    console.log('[GamePage] player_ready emitted');
  };

  const markWordGuessed = () => { 
    socket.emit("word_guessed"); 
    setCurrentWord(null); 
    console.log('[GamePage] word_guessed emitted');
  };

  const startTimerLocal = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(seconds);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          socket.emit("end_turn");
          console.log('[GamePage] end_turn emitted');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimerLocal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimer(0);
  };

  // ---- СОБЫТИЯ SOCKET.IO ----
  useEffect(() => {
    if (!socket) return;

    try { socket.emit('check_role', { roomId, userId }); } 
    catch (e) { console.warn('[GamePage] check_role emit failed', e); }

    const handlers = {
      role_info: (data) => console.log('[GamePage] role_info:', data),
      players_list: (data) => { setPlayers(data); console.log('[GamePage] players_list updated'); },
      phase_changed: (data) => {
        const { phase, round: newRound, type: newType, mode: newMode, roundTime: newRoundTime,
                wordsPerPlayer: newWPP, participants, scores: newScores, currentWord: cw,
                activePlayerId, guesserId, waitingStatus } = data;

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
        setCurrentWord(cw ?? null);
        if (newRound !== undefined) setRound(newRound);

        setIsReady(false);
        stopTimerLocal();

        console.log('[GamePage] phase_changed:', phase, 'round:', newRound);
      },
      reveal_word: ({ word }) => {
        setCurrentWord(word || null);
        console.log('[GamePage] reveal_word:', word);
      },
      waiting_for_players: ({ submitted, total }) => {
        setWaitingStatus({ submitted, total });
        console.log('[GamePage] waiting_for_players:', submitted, '/', total);
      },
      next_word: ({ word, scores: newScores }) => {
        if (newScores) setScores(newScores);
        console.log('[GamePage] next_word received:', word);
        setCurrentWord(isCurrentExplainer ? word : null);
      },
      turn_changed: ({ activePlayerId, guesserId, round: newRound, scores: newScores }) => {
        setActivePlayer(activePlayerId);
        setGuesser(guesserId);
        if (newRound !== undefined) setRound(newRound);
        if (newScores) setScores(newScores);
        setCurrentWord(null);
        setIsReady(false);
        stopTimerLocal();
        console.log('[GamePage] turn_changed: activePlayer=', activePlayerId, 'guesser=', guesserId, 'round=', newRound);
      },
      start_timer: ({ duration, timeLeft }) => { startTimerLocal(timeLeft ?? duration); console.log('[GamePage] start_timer:', timeLeft ?? duration); },
      update_timer: ({ timeLeft }) => { if (typeof timeLeft === "number") setTimer(timeLeft); console.log('[GamePage] update_timer:', timeLeft); },
      turn_time_up: () => { setIsReady(false); setCurrentWord(null); stopTimerLocal(); console.log('[GamePage] turn_time_up'); },
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
  }, [socket, isCurrentExplainer, userId, roomId]);

  // ---- ПОДГОТОВКА СЛОВ ----
  useEffect(() => { if (gamePhase === "enterWords") setUserWords(Array(wordsPerPlayer).fill("")); }, [gamePhase, wordsPerPlayer]);

  const submitWords = () => {
    if (!userWords.every(w => w.trim())) return alert("Заполните все слова!");
    socket.emit("submit_words", { words: userWords });
    console.log('[GamePage] submit_words emitted:', userWords);
  };

  const confirmPairs = () => { socket.emit("set_pairs", { pairs }); console.log('[GamePage] set_pairs emitted'); };
  const confirmTeams = () => { socket.emit("set_teams", { teams }); console.log('[GamePage] set_teams emitted'); };
  const endGameEarly = () => {
    if (!window.confirm("Закончить игру?")) return;
    socket.emit("end_game_early");
    setGamePhase("finished");
    stopTimerLocal();
    console.log('[GamePage] end_game_early emitted');
  };

  // ---- РЕНДЕР ----
  if (gamePhase === "setup") {
    if (!isCreator) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ожидайте создателя...</h2>
            <p className="text-gray-600">Создатель комнаты настраивает игру</p>
          </div>
        </div>
      );
    }
    return <HatSetupPage socket={socket} mode={mode} setMode={setMode} type={type} setType={setType} roundTime={roundTime} setRoundTime={setRoundTime} wordsPerPlayer={wordsPerPlayer} setWordsPerPlayer={setWordsPerPlayer} />;
  }

  if (gamePhase === "enterWords") {
    return <HatEnterWordsPage socket={socket} userWords={userWords} setUserWords={setUserWords} wordsPerPlayer={wordsPerPlayer} waitingStatus={waitingStatus} players={players} />;
  }

  if (gamePhase === "prepare_round") {
    if (!isCreator) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ожидайте создателя...</h2>
            <p className="text-gray-600">Создатель комнаты настраивает пары/команды</p>
          </div>
        </div>
      );
    }
    return (
      <HatPreparePairsPage 
        players={players}
        pairs={pairs}
        setPairs={setPairs}
        socket={socket}
        mode={mode}
        teams={teams}
        setTeams={setTeams}
        onConfirmPairs={confirmPairs}
        onConfirmTeams={confirmTeams}
        getPlayerName={getPlayerName}
        onEndGame={endGameEarly}
      />
    );
  }

  if (gamePhase === "game") {
    return (
      <div className="p-6 flex flex-col gap-8 max-w-4xl mx-auto">
        <HatRoundPage 
          userId={userId}
          round={round}
          timer={timer}
          activePlayer={activePlayer}
          guesser={guesser}
          currentWord={currentWord}
          isCurrentExplainer={isCurrentExplainer}
          players={players}
          mode={mode}
          getPlayerName={getPlayerName}
          onReady={handleReady}
          onWordGuessed={markWordGuessed}
        />
        <HatScoreboardPage players={players} scores={scores} getPlayerName={getPlayerName} onEndGame={endGameEarly} />
      </div>
    );
  }

  if (gamePhase === "finished") {
    return (
      <HatFinishPage
        mode={mode}
        players={players}
        teams={teams}
        scores={scores}
        getPlayerName={getPlayerName}
        navigate={navigate}
        roomId={roomId}
      />
    );
  }

  return <p className="p-6">Ожидание игры...</p>;
}
