import React, { useState, useEffect } from "react";
import "./styles.css";

// Получаем сегодняшнюю дату в формате ДД.ММ.ГГГГ
const getToday = () => {
  const d = new Date();
  return d.toLocaleDateString("ru-RU");
};

export default function StoneDailyReport() {
  // Справочники из backend
  const [positions, setPositions] = useState([]);
  const [bySize, setBySize] = useState({});
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [vidInput, setVidInput] = useState('');
  const [kolvo, setKolvo] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Получаем справочники с backend при загрузке формы
  useEffect(() => {
    async function fetchNomenclature() {
      const res = await fetch('https://lpaderina.store/webhook/nomenklatura');
      const data = await res.json();
      setBySize(data.bySize || {});
      setSizes(Object.keys(data.bySize || {}));
    }
    fetchNomenclature();
  }, []);

  // Фильтрация размеров по вводу
  const filteredSizes = sizes.filter((s) =>
    s.toLowerCase().includes(sizeInput.toLowerCase())
  );
  // Виды работ для выбранного размера (без фильтра по вводу)
  const currentVidOptions = bySize[sizeInput] || [];

  // Если нужен фильтр по вводу вида работ:
  const filteredVids = currentVidOptions.filter((v) =>
    v.toLowerCase().includes(vidInput.toLowerCase())
  );

  const handleAddPosition = () => {
    if (!sizeInput || !vidInput || !kolvo) return;
    setPositions([...positions, { date: getToday(), size: sizeInput, vid: vidInput, qty: kolvo }]);
    setSizeInput("");
    setVidInput("");
    setKolvo("");
  };

  const handleFinish = () => {
    setIsFinished(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsFinished(false);
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    // отправка в n8n/webhook
    await fetch('https://n8n.paderina-tech.ru/webhook-test/53b5e8c7-61a2-4164-a235-c79d25b95a11', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions }),
    });
    alert('Отправлено!');
    setPositions([]);
    setIsFinished(false);
  };

  return (
    <div className="daily-form-main">
      <div className="daily-title">Дата — {getToday()}</div>
      <div className="daily-sub">Введите позиции!</div>
      {/* форма добавления позиции */}
      {!isFinished && (
        <>
          {/* Размер */}
          <div className="daily-field">
            <label>Размер</label>
            <input
              type="text"
              className="daily-input"
              placeholder="Начните вводить..."
              value={sizeInput}
              onChange={(e) => {
                setSizeInput(e.target.value);
                setVidInput(''); // сбрасываем вид работы при смене размера
              }}
              disabled={isFinished && !isEditing}
              list="sizes-list"
            />
            <datalist id="sizes-list">
              {filteredSizes.map((s, i) => (
                <option value={s} key={i} />
              ))}
            </datalist>
          </div>
          {/* Вид работы */}
          <div className="daily-field">
            <label>Вид работы</label>
            <input
              type="text"
              className="daily-input"
              placeholder="Начните вводить..."
              value={vidInput}
              onChange={(e) => setVidInput(e.target.value)}
              disabled={!sizeInput || !(bySize[sizeInput] && bySize[sizeInput].length) || (isFinished && !isEditing)}
              list="vids-list"
            />
            <datalist id="vids-list">
              {filteredVids.map((v, i) => (
                <option value={v} key={i} />
              ))}
            </datalist>
          </div>
          {/* Количество */}
          <div className="daily-field">
            <label>Количество</label>
            <input
              type="number"
              className="daily-input"
              min="1"
              value={kolvo}
              onChange={(e) => setKolvo(e.target.value)}
              disabled={isFinished && !isEditing}
            />
          </div>
          <div className="daily-flex">
            <button
              className="daily-btn-main"
              onClick={handleAddPosition}
              disabled={!sizeInput || !vidInput || !kolvo}
            >
              Добавить ещё позицию
            </button>
            <button
              className="daily-btn-alt"
              onClick={handleFinish}
              disabled={positions.length === 0}
            >
              Завершить ввод
            </button>
          </div>
          {positions.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 500, color: "#555", marginBottom: 5 }}>
                Добавлено:
              </div>
              <ul className="daily-list">
                {positions.map((pos, i) => (
                  <li key={i}>
                    <span>
                      {pos.date} — {pos.size} — {pos.vid} — {pos.qty} шт.
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      {isFinished && (
        <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 25, paddingTop: 18 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Проверьте данные:</div>
          <ul className="daily-list">
            {positions.map((pos, i) => (
              <li key={i}>
                <span>
                  {pos.date} — {pos.size} — {pos.vid} — {pos.qty} шт.
                </span>
              </li>
            ))}
          </ul>
          <div className="daily-flex">
            <button
              className="daily-btn-gray"
              onClick={handleEdit}
              disabled={!isFinished}
            >
              Редактировать
            </button>
            <button
              className="daily-btn-main"
              onClick={handleSubmit}
              disabled={!isFinished}
            >
              Отправить результаты работы
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
