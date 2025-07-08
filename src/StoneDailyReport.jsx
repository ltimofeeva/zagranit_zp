import React, { useState, useEffect } from "react";
import "./styles.css";

const PencilIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

const getToday = () => {
  const d = new Date();
  return d.toLocaleDateString("ru-RU");
};

export default function StoneDailyReport() {
  const [positions, setPositions] = useState([]);
  const [bySize, setBySize] = useState({});
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [showSizes, setShowSizes] = useState(false);
  const [vidInput, setVidInput] = useState('');
  const [showVids, setShowVids] = useState(false);
  const [kolvo, setKolvo] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
      const updated = [...positions];
      updated[editIndex] = item;
      setPositions(updated);
      setEditIndex(null);
    } else {
      setPositions([...positions, item]);
    }
    setSizeInput("");
    setVidInput("");
    setKolvo("");
  };

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

  const handleFinish = () => {
    setIsDone(true);
    setEditIndex(null);
    setSizeInput("");
    setVidInput("");
    setKolvo("");
  };

  const handleReturnToEdit = () => {
    setIsDone(false);
    setShowSuccess(false);
  };

  const handleSubmit = async () => {
    await fetch('https://n8n.paderina-tech.ru/webhook-test/53b5e8c7-61a2-4164-a235-c79d25b95a11', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions }),
    });
    setShowSuccess(true);
    setPositions([]);
    setIsDone(false);
    setEditIndex(null);
    setSizeInput("");
    setVidInput("");
    setKolvo("");
    setTimeout(() => setShowSuccess(false), 4000);
  };

  // Сообщение "Спасибо за твой труд!"
  if (showSuccess) {
    return (
      <div className="daily-form-main">
        <div className="daily-title">Дата — {getToday()}</div>
        <div className="daily-sub" style={{ marginTop: 40, fontSize: 24, textAlign: "center", color: "#22c55e" }}>
          Спасибо за твой труд!
        </div>
      </div>
    );
  }

  // Если завершено редактирование, показываем только строки и две кнопки
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
                className="icon-btn"
                style={{ marginLeft: 8 }}
                title="Редактировать"
                onClick={() => {
                  setIsDone(false);
                  handleEditPosition(i);
                }}
              >
                <PencilIcon />
              </button>
              <button
                className="icon-btn"
                style={{ marginLeft: 4 }}
                title="Удалить"
                onClick={() => handleDeletePosition(i)}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
        <div className="daily-flex" style={{ marginTop: 30 }}>
          <button
            className="daily-btn-alt"
            onClick={handleReturnToEdit}
          >
            Вернуться к редактированию
          </button>
          <button
            className="daily-btn-main"
            style={{ marginLeft: 12 }}
            onClick={handleSubmit}
            disabled={positions.length === 0}
          >
            Отправить данные
          </button>
        </div>
      </div>
    );
  }

  // Основной режим: список, форма редактирования (под строкой) и форма добавления
  return (
    <div className="daily-form-main">
      <div className="daily-title">Дата — {getToday()}</div>
      <div className="daily-sub">Введите позиции!</div>
      <ul className="daily-list" style={{ marginTop: 14 }}>
        {positions.map((pos, i) => (
          <React.Fragment key={i}>
            <li style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              <span style={{ marginRight: 8 }}>
                {pos.size} {pos.vid} — {pos.qty} шт.
              </span>
              <button
                className="icon-btn"
                style={{ marginLeft: 8 }}
                title="Редактировать"
                onClick={() => handleEditPosition(i)}
              >
                <PencilIcon />
              </button>
              <button
                className="icon-btn"
                style={{ marginLeft: 4 }}
                title="Удалить"
                onClick={() => handleDeletePosition(i)}
              >
                <TrashIcon />
              </button>
            </li>
            {editIndex === i && (
              <li>
                <div className="daily-edit-form" style={{ marginTop: 8, marginBottom: 10 }}>
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
                      Сохранить
                    </button>
                  </div>
                </div>
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
      {/* Форма добавления новой позиции (только если не редактируем) */}
      {editIndex === null && (
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
              Сохранить
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
      )}
    </div>
  );
}
