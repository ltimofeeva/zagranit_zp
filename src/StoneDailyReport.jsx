import React, { useState, useEffect } from "react";
import "./styles.css";

const getToday = () => {
  const d = new Date();
  return d.toLocaleDateString("ru-RU");
};

export default function StoneDailyReport() {
  const [positions, setPositions] = useState([]);
  const [bySize, setBySize] = useState({});
  const [sizes, setSizes] = useState([]);
  // Форма ввода
  const [sizeInput, setSizeInput] = useState('');
  const [showSizes, setShowSizes] = useState(false);
  const [vidInput, setVidInput] = useState('');
  const [showVids, setShowVids] = useState(false);
  const [kolvo, setKolvo] = useState("");
  // Стейт режима
  const [editIndex, setEditIndex] = useState(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    async function fetchNomenclature() {
      const res = await fetch('https://lpaderina.store/webhook/nomenklatura');
      const data = await res.json();
      setBySize(data.bySize || {});
      setSizes(Object.keys(data.bySize || {}));
    }
    fetchNomenclature();
  }, []);

  const filteredSizes = sizes.filter((s) =>
    s.toLowerCase().includes(sizeInput.toLowerCase())
  );
  const currentVidOptions = bySize[sizeInput] || [];
  const filteredVids = currentVidOptions.filter((v) =>
    v.toLowerCase().includes(vidInput.toLowerCase())
  );

  // Сохраняем новую позицию или редактируем существующую
  const handleSave = () => {
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
    const item = { date: getToday(), size: sizeInput, vid: vidInput, qty: kolvo };
    if (editIndex !== null) {
      // Обновляем позицию
      const updated = [...positions];
      updated[editIndex] = item;
      setPositions(updated);
      setEditIndex(null);
    } else {
      // Добавляем новую
      setPositions([...positions, item]);
    }
    setSizeInput("");
    setVidInput("");
    setKolvo("");
  };

  // Редактировать позицию
  const handleEditPosition = (index) => {
    const pos = positions[index];
    setSizeInput(pos.size);
    setVidInput(pos.vid);
    setKolvo(pos.qty);
    setEditIndex(index);
    setIsDone(false);
    setShowSizes(false);
    setShowVids(false);
  };

  // Удалить позицию
  const handleDeletePosition = (index) => {
    const updated = [...positions];
    updated.splice(index, 1);
    setPositions(updated);
    if (editIndex === index) {
      setEditIndex(null);
      setSizeInput("");
      setVidInput("");
      setKolvo("");
    }
  };

  // Завершить редактирование (убрать форму)
  const handleFinish = () => {
    setIsDone(true);
    setEditIndex(null);
    setSizeInput("");
    setVidInput("");
    setKolvo("");
  };

  // Если в режиме "готово" — показываем только строки позиций
  if (isDone) {
    return (
      <div className="daily-form-main">
        <div className="daily-title">Дата — {getToday()}</div>
        <div className="daily-sub">Введённые позиции:</div>
        <ul className="daily-list" style={{ marginTop: 14 }}>
          {positions.map((pos, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              <span style={{ marginRight: 8 }}>
                {pos.size} {pos.vid} — {pos.qty} шт.
              </span>
              <button
                className="daily-btn-alt"
                style={{ marginLeft: 8, padding: "2px 8px", fontSize: 14 }}
                onClick={() => {
                  setIsDone(false);
                  handleEditPosition(i);
                }}
              >
                Редактировать
              </button>
              <button
                className="daily-btn-gray"
                style={{ marginLeft: 4, padding: "2px 8px", fontSize: 14 }}
                onClick={() => handleDeletePosition(i)}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="daily-form-main">
      <div className="daily-title">Дата — {getToday()}</div>
      <div className="daily-sub">Введите позиции!</div>
      <ul className="daily-list" style={{ marginTop: 14 }}>
        {positions.map((pos, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <span style={{ marginRight: 8 }}>
              {pos.size} {pos.vid} — {pos.qty} шт.
            </span>
            <button
              className="daily-btn-alt"
              style={{ marginLeft: 8, padding: "2px 8px", fontSize: 14 }}
              onClick={() => handleEditPosition(i)}
            >
              Редактировать
            </button>
            <button
              className="daily-btn-gray"
              style={{ marginLeft: 4, padding: "2px 8px", fontSize: 14 }}
              onClick={() => handleDeletePosition(i)}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
      {/* форма ввода/редактирования */}
      <div style={{ marginTop: 18 }}>
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
            disabled={!sizeInput || !(bySize[sizeInput] && bySize[sizeInput].length)}
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
        <div className="daily-field">
          <label>Количество</label>
          <input
            type="number"
            className="daily-input"
            min="1"
            value={kolvo}
            onChange={(e) => setKolvo(e.target.value)}
          />
        </div>
        <div className="daily-flex">
          <button
            className="daily-btn-main"
            onClick={handleSave}
            disabled={!sizeInput || !vidInput || !kolvo}
          >
            {editIndex !== null ? "Сохранить" : "Сохранить"}
          </button>
          <button
            className="daily-btn-alt"
            style={{ marginLeft: 8 }}
            onClick={handleFinish}
            disabled={positions.length === 0}
          >
            Завершить редактирование
          </button>
        </div>
      </div>
    </div>
  );
}
