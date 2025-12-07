import React from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";

export default function HatSetupPage({
  socket,
  mode,
  setMode,
  type,
  setType,
  roundTime,
  setRoundTime,
  wordsPerPlayer,
  setWordsPerPlayer,
  showToast
}) {
  const handleConfirm = () => {
    if (!Array.isArray(roundTime) || roundTime.some((t) => isNaN(t) || t <= 0)) {
      showToast('error', "Введите корректное время для всех раундов!");
      return;
    }
    if (!wordsPerPlayer || wordsPerPlayer <= 0) {
      showToast('error', "Введите корректное количество слов на игрока!");
      return;
    }

    const payload = { type, mode, roundTime, wordsPerPlayer };
    socket.emit("create_game", payload);
    console.log("[HatSetupPage] create_game emitted:", payload);
  };

  const handleCancel = () => {
    socket.emit("cancel_create_game");
    console.log("[HatSetupPage] cancel_create_game emitted");
  };

  const handleRoundTimeChange = (index, value) => {
    const updated = [...roundTime];
    updated[index] = Number(value) || 0;
    setRoundTime(updated);
  };

  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-center bg-[linear-gradient(0deg,rgba(239,246,255,1)_0%,rgba(239,246,255,1)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-white-athens-gray px-4 py-[120px]">
      <Card className="w-full max-w-2xl border-[#e5e7ebcc] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]">
        <CardHeader className="border-b border-[#e5e7ebcc] pt-[31px] pb-[33px] px-8">
          <CardTitle className="text-2xl font-semibold text-vulcan">Настройки игры</CardTitle>
          <CardDescription className="text-pale-sky text-base">
            Задайте параметры перед началом сессии.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 p-8">
          <div className="flex items-start justify-center gap-6 w-full flex-wrap">
            <div className="flex flex-col flex-1 gap-2 min-w-[180px]">
              <Label className="font-medium text-vulcan text-base">Режим игры</Label>
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(val) => val && setMode(val)}
                className="justify-start bg-athens-gray rounded-lg border border-solid border-[#2158ed] p-[5px]"
              >
                <ToggleGroupItem
                  value="solo"
                  className="flex-1 data-[state=on]:bg-white data-[state=on]:text-royal-blue data-[state=off]:text-pale-sky transition-colors"
                >
                  Соло
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="team"
                  className="flex-1 data-[state=on]:bg-white data-[state=on]:text-royal-blue data-[state=off]:text-pale-sky transition-colors"
                >
                  Команды
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-col flex-1 gap-2 min-w-[180px]">
              <Label className="font-medium text-vulcan text-base">Тип игры</Label>
              <ToggleGroup
                type="single"
                value={type}
                onValueChange={(val) => val && setType(val)}
                className="justify-start bg-athens-gray rounded-lg border border-solid border-[#2158ed] p-[5px]"
              >
                <ToggleGroupItem
                  value="online"
                  className="flex-1 data-[state=on]:bg-white data-[state=on]:text-royal-blue data-[state=off]:text-pale-sky transition-colors"
                >
                  Онлайн
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="offline"
                  className="flex-1 data-[state=on]:bg-white data-[state=on]:text-royal-blue data-[state=off]:text-pale-sky transition-colors"
                >
                  Оффлайн
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Label className="font-medium text-vulcan text-base">Слов на игрока</Label>
            <Input
              type="number"
              min={1}
              value={wordsPerPlayer}
              onChange={(e) => setWordsPerPlayer(Number(e.target.value) || 1)}
              className="h-12 bg-athens-gray border-gray-300 text-vulcan text-base"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Label className="font-medium text-vulcan text-base">Время на раунды (сек)</Label>
            <div className="flex items-center gap-6">
              {roundTime.map((time, index) => (
                <Input
                  key={index}
                  type="number"
                  min={1}
                  value={time}
                  onChange={(e) => handleRoundTimeChange(index, e.target.value)}
                  className="w-[68px] h-12 text-center bg-athens-gray border-gray-300"
                />
              ))}
            </div>
            <p className="text-pale-sky text-sm">
              Первый, второй и третий раунды соответственно
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-[33px] pb-8 px-8 border-t border-[#e5e7ebcc]">
          <div className="flex items-start justify-center gap-4 w-full">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="flex-1 h-12 bg-[#e5e7ebcc] text-oxford-blue hover:bg-[#e5e7ebcc]/80 transition-colors"
            >
              Отмена
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 h-12 bg-[#2158ed] text-white hover:bg-[#2158ed]/90 transition-colors"
            >
              Подтвердить
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
