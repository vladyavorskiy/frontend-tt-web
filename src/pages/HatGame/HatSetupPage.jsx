import React, { useState, useEffect } from "react";

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
    
    if (value === "") return "Поле не может быть пустым";
    if (isNaN(numValue)) return "Введите корректное число";
    if (numValue < min) return `Значение должно быть не меньше ${min}`;
    if (!Number.isInteger(numValue)) return "Введите целое число";
    
    return "";
  };

  const handleWordsChange = (value) => {
    setLocalWordsPerPlayer(value);
    const error = validateNumber(value, "words", 1);
    setErrors(prev => ({ ...prev, words: error }));
    if (!error && value !== "") {
      setWordsPerPlayer(parseInt(value, 10));
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
      const updatedRoundTime = [...roundTime];
      updatedRoundTime[index] = parseInt(value, 10);
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
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleConfirm = () => {
    if (!validateAllFields()) {
      showToast('error', "Исправьте ошибки в полях ввода");
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

    socket.emit("create_game", { type, mode, roundTime: timeValues, wordsPerPlayer: wordsValue });
    console.log("[HatSetupPage] create_game emitted:", { type, mode, roundTime: timeValues, wordsPerPlayer: wordsValue });
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="bg-[#1E293B] px-5 py-4">
            <h2 className="text-base font-semibold text-white">Настройки игры</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">Задайте параметры перед началом</p>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1E293B]">Режим</label>
                <div className="flex gap-1 p-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                  <button
                    onClick={() => setMode("solo")}
                    className={`flex-1 h-8 text-xs font-medium rounded transition-colors ${
                      mode === "solo"
                        ? "bg-[#3B82F6] text-white"
                        : "text-[#1E293B] hover:bg-[#E2E8F0]"
                    }`}
                  >
                    Соло
                  </button>
                  <button
                    onClick={() => setMode("team")}
                    className={`flex-1 h-8 text-xs font-medium rounded transition-colors ${
                      mode === "team"
                        ? "bg-[#3B82F6] text-white"
                        : "text-[#1E293B] hover:bg-[#E2E8F0]"
                    }`}
                  >
                    Команды
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1E293B]">Тип</label>
                <div className="flex gap-1 p-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                  <button
                    onClick={() => setType("online")}
                    className={`flex-1 h-8 text-xs font-medium rounded transition-colors ${
                      type === "online"
                        ? "bg-[#10B981] text-white"
                        : "text-[#1E293B] hover:bg-[#E2E8F0]"
                    }`}
                  >
                    Онлайн
                  </button>
                  <button
                    onClick={() => setType("offline")}
                    className={`flex-1 h-8 text-xs font-medium rounded transition-colors ${
                      type === "offline"
                        ? "bg-[#10B981] text-white"
                        : "text-[#1E293B] hover:bg-[#E2E8F0]"
                    }`}
                  >
                    Оффлайн
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1E293B]">Слов на игрока</label>
              <input
                type="text"
                inputMode="numeric"
                value={localWordsPerPlayer}
                onChange={(e) => handleInputChange(e.target.value, handleWordsChange)}
                onBlur={() => handleBlur(localWordsPerPlayer, "words", 8, handleWordsChange)}
                className={`w-full h-9 px-3 bg-white border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
                  errors.words
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-[#CBD5E1] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                }`}
                placeholder="Введите число"
              />
              {errors.words && (
                <p className="text-red-500 text-[10px] mt-1">{errors.words}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1E293B]">Время на раунды (сек)</label>
              <div className="grid grid-cols-3 gap-2">
                {roundTime.map((_, index) => {
                  const defaultValues = [30, 40, 20];
                  return (
                    <div key={index} className="space-y-1">
                      <div className="text-center">
                        <span className="text-[10px] font-medium text-[#64748B]">Раунд {index + 1}</span>
                      </div>
                      <input
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
                        className={`w-full h-9 text-center bg-white border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
                          errors[`time${index + 1}`]
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-[#CBD5E1] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                        }`}
                        placeholder="сек"
                      />
                      {errors[`time${index + 1}`] && (
                        <p className="text-red-500 text-[8px] text-center">{errors[`time${index + 1}`]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={handleCancel}
                className="flex-1 h-9 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#1E293B] text-xs font-medium rounded-md transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 h-9 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                disabled={Object.values(errors).some(error => error !== "")}
              >
                Начать игру
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}