import React, { useState } from "react";

// Примерные справочники (подключи к API, если надо)
const VIDS = ["Матовая", "Глянцевая", "Бучард", "Сатин", "Антик", "Термо"];
const SIZES = ["60x30", "80x40", "100x60", "50x50", "120x60", "40x20", "100x100"];

// Получить дату в формате ДД.ММ.ГГГГ
const getToday = () => {
  const d = new Date();
  return d.toLocaleDateString("ru-RU");
};

export default function StoneDailyReport() {
  const [positions, setPositions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [vidInput, setVidInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [kolvo, setKolvo] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Пример позиций за вчера (подключи к бекенду, если нужно)
  const yesterdayPositions = [
    { vid: "Матовая", size: "60x30", qty: 12 },
    { vid: "Глянцевая", size: "80x40", qty: 5 },
  ];

  // Фильтрация списков
  const filteredVids = VIDS.filter((v) =>
    v.toLowerCase().includes(vidInput.toLowerCase())
  );
  const filteredSizes = SIZES.filter((s) =>
    s.toLowerCase().includes(sizeInput.toLowerCase())
  );

  // Добавить новую позицию
  const handleAddPosition = () => {
    if (!vidInput || !sizeInput || !kolvo) return;
    setPositions([...positions, { vid: vidInput, size: sizeInput, qty: kolvo }]);
    setVidInput("");
    setSizeInput("");
    setKolvo("");
  };

  // Использовать вчерашние позиции
  const handleUseYesterday = () => {
    setPositions(yesterdayPositions);
    setIsFinished(true);
  };

  // Завершить ввод
  const handleFinish = () => {
    setIsFinished(true);
    setIsEditing(false);
  };

  // Редактировать
  const handleEdit = () => {
    setIsFinished(false);
    setIsEditing(true);
  };

  // Отправить данные (замени на интеграцию с n8n)
  const handleSubmit = async () => {
    alert(
      "Отправлено в Google Sheets!\n" + JSON.stringify(positions, null, 2)
    );
    setPositions([]);
    setShowForm(false);
    setIsFinished(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 text-base">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6">
        <div className="text-xl font-bold mb-1 text-center">
          Дата — {getToday()}
        </div>
        <div className="mb-4 text-gray-700 text-center">
          Позиции за вчера:
        </div>
        <ul className="mb-3 flex flex-col gap-1">
          {yesterdayPositions.map((pos, i) => (
            <li
              key={i}
              className="bg-slate-100 rounded-xl px-3 py-1 flex justify-between"
            >
              <span>
                {pos.vid} — {pos.size} — {pos.qty} шт.
              </span>
            </li>
          ))}
        </ul>
        {!showForm && (
          <button
            className="w-full mb-2 bg-blue-600 text-white rounded-2xl py-2 font-semibold shadow-md hover:bg-blue-700 transition"
            onClick={handleUseYesterday}
          >
            Использовать значения
          </button>
        )}
        <div className="w-full flex items-center justify-center mb-1">
          <span className="text-sm text-gray-400 mx-2">или</span>
        </div>
        {!showForm && (
          <button
            className="w-full bg-green-500 text-white rounded-2xl py-2 font-semibold shadow-md hover:bg-green-600 transition"
            onClick={() => setShowForm(true)}
          >
            Добавить новые
          </button>
        )}
        {showForm && !isFinished && (
          <div className="border-t mt-4 pt-4">
            <div className="mb-2 font-semibold text-gray-700">
              Добавление позиции
            </div>
            {/* Вид полировки */}
            <div className="mb-3">
              <label className="block mb-1">Вид</label>
              <input
                type="text"
                className="w-full rounded-xl border px-3 py-2"
                placeholder="Начните вводить..."
                value={vidInput}
                onChange={(e) => setVidInput(e.target.value)}
                disabled={isFinished && !isEditing}
              />
              {vidInput && filteredVids.length > 0 && (
                <div className="bg-white rounded-xl shadow border mt-1 max-h-32 overflow-y-auto">
                  {filteredVids.map((v, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => setVidInput(v)}
                    >
                      {v}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Размер */}
            <div className="mb-3">
              <label className="block mb-1">Размер</label>
              <input
                type="text"
                className="w-full rounded-xl border px-3 py-2"
                placeholder="Начните вводить..."
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                disabled={isFinished && !isEditing}
              />
              {sizeInput && filteredSizes.length > 0 && (
                <div className="bg-white rounded-xl shadow border mt-1 max-h-32 overflow-y-auto">
                  {filteredSizes.map((s, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => setSizeInput(s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Количество */}
            <div className="mb-3">
              <label className="block mb-1">Количество</label>
              <input
                type="number"
                className="w-full rounded-xl border px-3 py-2"
                min="1"
                value={kolvo}
                onChange={(e) => setKolvo(e.target.value)}
                disabled={isFinished && !isEditing}
              />
            </div>
            <div className="flex gap-3 mb-2">
              <button
                className="flex-1 bg-blue-500 text-white rounded-2xl py-2 font-semibold hover:bg-blue-600"
                onClick={handleAddPosition}
                disabled={!vidInput || !sizeInput || !kolvo}
              >
                Добавить ещё позицию
              </button>
              <button
                className="flex-1 bg-emerald-600 text-white rounded-2xl py-2 font-semibold hover:bg-emerald-700"
                onClick={handleFinish}
                disabled={positions.length === 0}
              >
                Завершить ввод
              </button>
            </div>
            {/* Показать добавленные позиции */}
            {positions.length > 0 && (
              <div className="mt-2">
                <div className="font-medium mb-1 text-gray-500">Добавлено:</div>
                <ul className="flex flex-col gap-1">
                  {positions.map((pos, i) => (
                    <li
                      key={i}
                      className="bg-gray-100 rounded-xl px-3 py-1 flex justify-between"
                    >
                      <span>
                        {pos.vid} — {pos.size} — {pos.qty} шт.
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {/* Этап проверки/отправки */}
        {(isFinished || (!showForm && positions.length > 0)) && (
          <div className="border-t mt-5 pt-4">
            <div className="mb-2 font-semibold">Проверьте данные:</div>
            <ul className="mb-3 flex flex-col gap-1">
              {positions.map((pos, i) => (
                <li
                  key={i}
                  className="bg-gray-100 rounded-xl px-3 py-1 flex justify-between"
                >
                  <span>
                    {pos.vid} — {pos.size} — {pos.qty} шт.
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-400 text-white rounded-2xl py-2 font-semibold hover:bg-gray-500"
                onClick={handleEdit}
                disabled={!isFinished}
              >
                Редактировать
              </button>
              <button
                className="flex-1 bg-blue-600 text-white rounded-2xl py-2 font-semibold hover:bg-blue-800"
                onClick={handleSubmit}
                disabled={!isFinished}
              >
                Отправить результаты работы
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
