import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <main className="flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl space-y-8">
            <Card className="w-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-xl">
              <CardContent className="p-6 md:p-10">
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <div className="inline-block p-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                        Введите ваши слова
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Введите {wordsPerPlayer} слов для игры
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {Array.from({ length: wordsPerPlayer }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-md">
                              {index + 1}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <Input
                              id={`word-${index}`}
                              value={userWords[index] || ""}
                              onChange={(e) => handleChangeWord(index, e.target.value)}
                              placeholder={`Слово ${index + 1}`}
                              className="w-full h-12 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all pl-4 pr-4"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                      >
                        Отправить слова
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-green-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  Ожидание: <span className="font-bold text-green-600 dark:text-green-400">{waitingStatus.submitted}</span> /{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">{waitingStatus.total || players.length}</span> игроков
                </p>
              </div>
              <div className="w-full max-w-md mx-auto">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${(waitingStatus.submitted / (waitingStatus.total || players.length)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Игра начнется, когда все участники отправят свои слова
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}