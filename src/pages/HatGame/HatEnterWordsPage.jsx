// HatGame/HatEnterWordsPage.jsx - Без Header
import React from "react";

export default function HatEnterWordsPage({
  socket,
  userWords,
  setUserWords,
  wordsPerPlayer,
  waitingStatus,
  players,
  showToast
}) {
  const handleChangeWord = (index, value) => {
    const updated = [...userWords];
    updated[index] = value;
    setUserWords(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!Array.isArray(userWords) ||
        userWords.length !== wordsPerPlayer ||
        userWords.some((w) => !w || !w.trim())) {
      showToast('error', "Пожалуйста, заполните все слова!");
      return;
    }

    socket.emit("submit_words", { words: userWords });
    console.log("[HatEnterWordsPage] submit_words emitted:", userWords);
  };

  const totalPlayers = waitingStatus.total || players.length;
  const submittedCount = waitingStatus.submitted;
  const progressPercent = totalPlayers > 0 ? Math.round((submittedCount / totalPlayers) * 100) : 0;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[466px]">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black leading-7">Введите ваши слова</h2>
            <p className="text-sm text-gray-600 mt-1 leading-5">
              Введите {wordsPerPlayer} {getWordDeclension(wordsPerPlayer)} для игры
            </p>
          </div>

          <div className="px-6 py-6 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              {Array.from({ length: wordsPerPlayer }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={userWords[index] || ""}
                    onChange={(e) => handleChangeWord(index, e.target.value)}
                    placeholder={`Слово ${index + 1}`}
                    className="flex-1 h-[41px] px-3 rounded-md border border-gray-300 bg-white text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold uppercase tracking-wide rounded-lg transition-colors"
            >
              Отправить слова
            </button>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Прогресс: {submittedCount}/{totalPlayers}
                </span>
                <span className="text-sm font-medium text-gray-700">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Игра начнется, когда все отправят слова
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getWordDeclension(count) {
  if (count % 10 === 1 && count % 100 !== 11) return "слово";
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "слова";
  return "слов";
}