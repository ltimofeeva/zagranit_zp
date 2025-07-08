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
  const [showSizes, setShowSizes] = useState(false);
  const [vidInput, setVidInput] = useState('');
  const [showVids, setShowVids] = useState(false);
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
  // Виды работ для выбранного размера
  const currentVidOptions = bySize[sizeInput] || [];
  const filteredVids = currentVidOptions.filter((v) =>
    v.toLowerCase().includes(vidInput.toLowerCase())
  );

  const handleAddPosition = () => {
    // Проверка: размер и вид должны быть выбраны из справочника
    if (
      !sizeInput ||
      !vidInput ||
      !kolvo ||
      !sizes.includes(sizeInput) ||
      !(bySize[sizeInput] || []).includes(vidInput)
    ) {
      alert("Выберите корректный размер и вид работы из списка!");
      return;
    }
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
      {!isFinished && (
        <>
          {/* Размер */}
          <div className="daily-field" style={{ position: "relative" }}>
            <label>Размер</label>
            <input
              type="text"
              className="daily-input"
              placeholder="Начните вводить или выберите..."
              value={sizeInput}
              onChange={e => {
                setSizeInput(e.target.value);
                setShowSizes(true);
                setVidInput("");
              }}
              onFocus={() => setShowSizes(true)}
              onBlur={() => setTimeout(() => setShowSizes(false), 100)}
              autoComplete="off"
              disabled={isFinished && !isEditing}
            />
            <button
              type="button"
              className="combo-arrow"
              style={{
                position: "absolute",
                right: 10,
                top: 35,
                background: "none",
                border: "none",
                cursor: "pointer",
                zIndex: 3
              }}
              tabIndex={-1}
              onMouseDown={e => {
                e.preventDefault();
                setShowSizes(v => !v);
              }}
            >▼</button>
            {showSizes && filteredSizes.length > 0 && (
              <div className="daily-list-small" style={{
                position: "absolute",
                left: 0,
                right: 0,
                zIndex: 2,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                maxHeight: 180,
                overflowY: "auto"
              }}>
                {filteredSizes.map((s, i) => (
                  <div
                    key={i}
                    onMouseDown={() => {
                      setSizeInput(s);
                      setShowSizes(false);
                      setVidInput("");
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer"
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Вид работы */}
          <div className="daily-field" style={{ position: "relative" }}>
            <label>Вид работы</label>
            <input
              type="text"
              className="daily-input"
              placeholder="Начните вводить или выберите..."
              value={vidInput}
              onChange={e => {
                setVidInput(e.target.value);
                setShowVids(true);
              }}
              onFocus={() => setShowVids(true)}
              onBlur={() => setTimeout(() => setShowVids(false), 100)}
              autoComplete="off"
              disabled={!sizeInput || !(bySize[sizeInput] && bySize[sizeInput].length) || (isFinished && !isEditing)}
            />
            <button
              type="button"
              className="combo-arrow"
              style={{
                position: "absolute",
                right: 10,
                top: 35,
                background: "none",
                border: "none",
                cursor: "pointer",
                zIndex: 3
              }}
              tabIndex={-1}
              onMouseDown={e => {
                e.preventDefault();
                setShowVids(v => !v);
              }}
            >▼</button>
            {showVids && filteredVids.length > 0 && (
              <div className="daily-list-small" style={{
                position: "absolute",
                left: 0,
                right: 0,
                zIndex: 2,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                maxHeight: 180,
                overflowY: "auto"
              }}>
                {filteredVids.map((v, i) => (
                  <div
                    key={i}
                    onMouseDown={() => {
                      setVidInput(v);
                      setShowVids(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer"
                    }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            )}
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
