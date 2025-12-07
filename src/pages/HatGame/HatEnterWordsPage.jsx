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
    <div className="flex flex-col min-h-screen items-start bg-[linear-gradient(0deg,rgba(239,246,255,1)_0%,rgba(239,246,255,1)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-white-athens-gray">
      <div className="flex flex-col items-start w-full flex-1 overflow-y-auto">
        <main className="flex flex-col items-center justify-center px-8 py-32 w-full flex-1">
          <div className="flex flex-col items-start gap-6 max-w-2xl w-full">
            <Card className="w-full bg-white rounded-xl border border-solid shadow-[0px_1px_2px_#0000000d]">
              <CardContent className="pt-10 pb-[41px] px-[41px]">
                <div className="flex flex-col items-start gap-8 w-full">
                  <div className="flex items-center w-full flex-col">
                    <h2 className="font-bold text-3xl text-ebony text-center">
                      Введите ваши слова
                    </h2>
                  </div>

                  <form className="flex flex-col items-start gap-4 w-full" onSubmit={handleSubmit}>
                    {Array.from({ length: wordsPerPlayer }).map((_, index) => (
                      <div key={index} className="flex flex-col items-start gap-1 w-full">
                        <Label htmlFor={`word-${index}`} className="font-medium text-oxford-blue">
                          Слово {index + 1}
                        </Label>
                        <Input
                          id={`word-${index}`}
                          value={userWords[index] || ""}
                          onChange={(e) => handleChangeWord(index, e.target.value)}
                          className="w-full h-[42px] bg-white rounded-lg border border-solid border-gray-300 shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-royal-blue"
                        />
                      </div>
                    ))}

                    <Button
                      type="submit"
                      className="h-14 w-full bg-[#2158ed] hover:bg-[#1a47c9] rounded-full transition-colors"
                    >
                      Отправить слова
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col items-center w-full">
              <p className="text-pale-sky text-center text-sm">
                Ожидание: {waitingStatus.submitted} / {waitingStatus.total || players.length} игроков
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
