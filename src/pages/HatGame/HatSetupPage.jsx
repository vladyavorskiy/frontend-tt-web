import React, { useState, useEffect } from "react";
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
  const [localWordsPerPlayer, setLocalWordsPerPlayer] = useState(wordsPerPlayer.toString());
  const [localRoundTime, setLocalRoundTime] = useState(roundTime.map(t => t.toString()));
  const [errors, setErrors] = useState({
    words: "",
    time1: "",
    time2: "",
    time3: ""
  });

  useEffect(() => {
    setLocalWordsPerPlayer(wordsPerPlayer.toString());
  }, [wordsPerPlayer]);

  useEffect(() => {
    setLocalRoundTime(roundTime.map(t => t.toString()));
  }, [roundTime]);

  const validateNumber = (value, fieldName, min = 1) => {
    const numValue = parseInt(value, 10);
    
    if (value === "") {
      return "Поле не может быть пустым";
    }
    
    if (isNaN(numValue)) {
      return "Введите корректное число";
    }
    
    if (numValue < min) {
      return `Значение должно быть не меньше ${min}`;
    }
    
    if (!Number.isInteger(numValue)) {
      return "Введите целое число";
    }
    
    return "";
  };

  const handleWordsChange = (value) => {
    setLocalWordsPerPlayer(value);
    
    const error = validateNumber(value, "words", 1);
    setErrors(prev => ({ ...prev, words: error }));
    
    if (!error && value !== "") {
      const numValue = parseInt(value, 10);
      setWordsPerPlayer(numValue);
    }
  };

  const handleRoundTimeChange = (index, value) => {
    const newRoundTime = [...localRoundTime];
    newRoundTime[index] = value;
    setLocalRoundTime(newRoundTime);
    
    const fieldName = `time${index + 1}`;
    const error = validateNumber(value, fieldName, 1);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    
    if (!error && value !== "") {
      const numValue = parseInt(value, 10);
      const updatedRoundTime = [...roundTime];
      updatedRoundTime[index] = numValue;
      setRoundTime(updatedRoundTime);
    }
  };

  const validateAllFields = () => {
    const newErrors = {
      words: validateNumber(localWordsPerPlayer, "words", 1),
      time1: validateNumber(localRoundTime[0], "time1", 1),
      time2: validateNumber(localRoundTime[1], "time2", 1),
      time3: validateNumber(localRoundTime[2], "time3", 1)
    };
    
    setErrors(newErrors);
    
    const hasErrors = Object.values(newErrors).some(error => error !== "");
    return !hasErrors;
  };

  const handleConfirm = () => {
    if (!validateAllFields()) {
      showToast('error', "Исправьте ошибки в полях ввода");
      return;
    }

    if (!localWordsPerPlayer || localRoundTime.some(t => !t)) {
      showToast('error', "Все поля должны быть заполнены");
      return;
    }

    const wordsValue = parseInt(localWordsPerPlayer, 10);
    const timeValues = localRoundTime.map(t => parseInt(t, 10));

    if (timeValues.some(t => isNaN(t) || t <= 0)) {
      showToast('error', "Введите корректное время для всех раундов!");
      return;
    }
    
    if (isNaN(wordsValue) || wordsValue <= 0) {
      showToast('error', "Введите корректное количество слов на игрока!");
      return;
    }

    const payload = { type, mode, roundTime: timeValues, wordsPerPlayer: wordsValue };
    socket.emit("create_game", payload);
    console.log("[HatSetupPage] create_game emitted:", payload);
  };

  const handleCancel = () => {
    socket.emit("cancel_create_game");
    console.log("[HatSetupPage] cancel_create_game emitted");
  };

  const handleInputChange = (value, onChange) => {
    if (value === "" || /^\d+$/.test(value)) {
      onChange(value);
    }
  };

  const handleBlur = (value, fieldName, defaultValue, onBlurChange) => {
    if (value === "") {
      onBlurChange(defaultValue.toString());
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8">
          <div className="flex items-center gap-3 mb-2">
            <div>
              <CardTitle className="text-3xl font-bold">Настройки игры</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Задайте параметры перед началом сессии
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="font-semibold text-gray-700 dark:text-gray-300 text-lg flex items-center gap-2">
                Режим игры
              </Label>
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(val) => val && setMode(val)}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 p-1"
              >
                <ToggleGroupItem
                  value="solo"
                  className="flex-1 data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-purple-500 data-[state=on]:text-white data-[state=off]:text-gray-600 dark:data-[state=off]:text-gray-400 px-6 py-3 rounded-lg transition-all"
                >
                  Соло
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="team"
                  className="flex-1 data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-purple-500 data-[state=on]:text-white data-[state=off]:text-gray-600 dark:data-[state=off]:text-gray-400 px-6 py-3 rounded-lg transition-all"
                >
                  Команды
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold text-gray-700 dark:text-gray-300 text-lg flex items-center gap-2">
                Тип игры
              </Label>
              <ToggleGroup
                type="single"
                value={type}
                onValueChange={(val) => val && setType(val)}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 p-1"
              >
                <ToggleGroupItem
                  value="online"
                  className="flex-1 data-[state=on]:bg-gradient-to-r data-[state=on]:from-green-500 data-[state=on]:to-emerald-500 data-[state=on]:text-white data-[state=off]:text-gray-600 dark:data-[state=off]:text-gray-400 px-6 py-3 rounded-lg transition-all"
                >
                  Онлайн
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="offline"
                  className="flex-1 data-[state=on]:bg-gradient-to-r data-[state=on]:from-green-500 data-[state=on]:to-emerald-500 data-[state=on]:text-white data-[state=off]:text-gray-600 dark:data-[state=off]:text-gray-400 px-6 py-3 rounded-lg transition-all"
                >
                  Оффлайн
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-semibold text-gray-700 dark:text-gray-300 text-lg flex items-center gap-2">
              Слов на игрока
            </Label>
            <div className="space-y-2">
              <Input
                type="text"
                inputMode="numeric"
                value={localWordsPerPlayer}
                onChange={(e) => handleInputChange(e.target.value, handleWordsChange)}
                onBlur={() => handleBlur(localWordsPerPlayer, "words", 8, handleWordsChange)}
                className={`h-12 bg-gray-50 dark:bg-gray-700 border-2 ${
                  errors.words 
                    ? "border-red-500 dark:border-red-500" 
                    : "border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                } text-gray-800 dark:text-white text-lg rounded-xl focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all`}
                placeholder="Введите число"
              />
              {errors.words && (
                <p className="text-red-500 dark:text-red-400 text-sm flex items-center gap-1">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.words}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-semibold text-gray-700 dark:text-gray-300 text-lg flex items-center gap-2">
              Время на раунды (сек)
            </Label>
            <div className="grid grid-cols-3 gap-4">
              {roundTime.map((_, index) => {
                const defaultValues = [30, 40, 20];
                return (
                  <div key={index} className="space-y-2">
                    <div className="text-center">
                      <span className="inline-block w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-center leading-8">
                        {index + 1}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={localRoundTime[index]}
                        onChange={(e) => handleInputChange(e.target.value, (value) => handleRoundTimeChange(index, value))}
                        onBlur={() => handleBlur(
                          localRoundTime[index], 
                          `time${index + 1}`, 
                          defaultValues[index], 
                          (value) => handleRoundTimeChange(index, value)
                        )}
                        className={`w-full h-12 text-center bg-gray-50 dark:bg-gray-700 border-2 ${
                          errors[`time${index + 1}`] 
                            ? "border-red-500 dark:border-red-500" 
                            : "border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                        } rounded-xl text-lg font-semibold transition-all`}
                        placeholder="сек"
                      />
                      {errors[`time${index + 1}`] && (
                        <p className="text-red-500 dark:text-red-400 text-xs text-center">
                          {errors[`time${index + 1}`]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              Первый, второй и третий раунды соответственно
            </p>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 dark:bg-gray-900/50 p-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-14 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-lg font-semibold transition-all"
            >
              Отмена
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={Object.values(errors).some(error => error !== "")}
            >
              Начать игру
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}