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

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="bg-[#1E293B] px-5 py-4">
            <h2 className="text-base font-semibold text-white">Введите ваши слова</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">Введите {wordsPerPlayer} слов для игры</p>
          </div>

          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                {Array.from({ length: wordsPerPlayer }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#F1F5F9] rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-medium text-[#1E293B]">{index + 1}</span>
                    </div>
                    <input
                      value={userWords[index] || ""}
                      onChange={(e) => handleChangeWord(index, e.target.value)}
                      placeholder={`Слово ${index + 1}`}
                      className="flex-1 h-9 px-3 bg-white border border-[#CBD5E1] rounded-md text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full h-9 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium rounded-md transition-colors"
              >
                Отправить слова
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[#64748B]">Прогресс</span>
                <span className="text-xs font-medium text-[#1E293B]">
                  {waitingStatus.submitted} / {waitingStatus.total || players.length}
                </span>
              </div>
              <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                  style={{ width: `${(waitingStatus.submitted / (waitingStatus.total || players.length)) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-[#64748B] text-center mt-2">
                Игра начнется, когда все отправят слова
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}