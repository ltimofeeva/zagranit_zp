import React, { useState, useEffect } from "react";
import "./styles.css";

// SVG-иконки
const PencilIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
);
const TrashIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);
const CrossIcon = () => (
  <svg width="16" height="16" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
  const [wasDoneBeforeEdit, setWasDoneBeforeEdit] = useState(false);
  const [sheetOptions, setSheetOptions] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(""); // выбранный лист

  useEffect(() => {
    async function fetchInitialData() {
      // 1. Получаем номенклатуру
      const resNomenclature = await fetch('https://lpaderina.store/webhook/nomenklatura');
      const dataNomenclature = await resNomenclature.json();
      setBySize(dataNomenclature.bySize || {});
      setSizes(Object.keys(dataNomenclature.bySize || {}));

      // 2. Получаем список листов работников
      const resSheets = await fetch('https://lpaderina.store/webhook/rabotniki');
      const dataSheets = await resSheets.json();
     if (dataSheets.list_name) {
      console.log("RAW list_name:", dataSheets.list_name);
      const parsed = JSON.parse(dataSheets.list_name);
      console.log("Parsed list_name:", parsed);
      setSheetOptions(parsed);
     }
      if (Array.isArray(dataSheets) && dataSheets[0] && dataSheets[0].list_name) {
        try {
          const options = JSON.parse(dataSheets[0].list_name);
          setSheetOptions(options);
        } catch (e) {
          setSheetOptions([]);
        }
      }
    }
    fetchInitialData();
  }, []);

  const filteredSizes = sizes.filter((s) =>
    s.toLowerCase().includes(sizeInput.toLowerCase())
  );
  const currentVidOptions = bySize[sizeInput] || [];
  const filteredVids = currentVidOptions.filter((v) =>
    v.toLowerCase().includes(vidInput.toLowerCase())
  );

  const handleSave = () => {
    const item = { date: getToday(), size: sizeInput, vid: vidInput, qty: kolvo };
    if (editIndex !== null) {
      const updated = [...positions];
      updated[editIndex] = item;
      setPositions(updated);
      setEditIndex(null);
      setSizeInput("");
      setVidInput("");
      setKolvo("");
      if (wasDoneBeforeEdit) {
        setIsDone(true);
        setWasDoneBeforeEdit(false);
      }
    } else {
      setPositions([...positions, item]);
      setSizeInput("");
      setVidInput("");
      setKolvo("");
    }
  };

  const handleEditPosition = (index) => {
    const pos = positions[index];
    setSizeInput(pos.size);
    setVidInput(pos.vid);
    setKolvo(pos.qty);
    setEditIndex(index);
    setIsDone(false);
    setWasDoneBeforeEdit(isDone);
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
    await fetch('https://lpaderina.store/webhook-test/70e744f0-35d8-4252-ba73-25db1d52dbf9', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions, sheet: selectedSheet }),
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
        {/* Селект листа */}
        <div className="daily-field">
          <label>Фамилия</label>
          <select
            className="daily-input"
            value={selectedSheet}
            onChange={e => setSelectedSheet(e.target.value)}
          >
            <option value="">Выберите фамилию...</option>
            {sheetOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="daily-sub">Введённые позиции:</div>
        <ul className="daily-list" style={{ marginTop: 14 }}>
          {positions.map((pos, i) => (
            <li key={i}>
              <span>
                {pos.size} {pos.vid} — {pos.qty} шт.
              </span>
              <span style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                <button
                  className="icon-btn"
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
                  title="Удалить"
                  onClick={() => handleDeletePosition(i)}
                >
                  <TrashIcon />
                </button>
              </span>
            </li>
          ))}
        </ul>
        <div className="daily-flex" style={{ marginTop: 30 }}>
          <button
            className="daily-btn-main daily-btn-small"
            onClick={handleReturnToEdit}
          >
            Вернуться к редактированию
          </button>
          <button
            className="daily-btn-alt daily-btn-small"
            onClick={handleSubmit}
            disabled={positions.length === 0 || !selectedSheet}
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
      {/* Селект листа под датой */}
      <div className="daily-field">
        <label>Фамилия</label>
        <select
          className="daily-input"
          value={selectedSheet}
          onChange={e => setSelectedSheet(e.target.value)}
        >
          <option value="">Выберите фамилию...</option>
          {sheetOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="daily-sub">Введите позиции</div>
      <ul className="daily-list" style={{ marginTop: 14 }}>
        {positions.map((pos, i) => (
          <React.Fragment key={i}>
            <li>
              <span>
                {pos.size} {pos.vid} — {pos.qty} шт.
              </span>
              <span style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                <button
                  className="icon-btn"
                  title="Редактировать"
                  onClick={() => handleEditPosition(i)}
                >
                  <PencilIcon />
                </button>
                <button
                  className="icon-btn"
                  title="Удалить"
                  onClick={() => handleDeletePosition(i)}
                >
                  <TrashIcon />
                </button>
              </span>
            </li>
            {editIndex === i && (
              <li>
                <div className="daily-edit-form" style={{ marginTop: 8, marginBottom: 10 }}>
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
                    />
                    {sizeInput && (
                      <button
                        type="button"
                        className="clear-btn"
                        onClick={() => setSizeInput("")}
                        tabIndex={-1}
                        aria-label="Очистить поле"
                      ><CrossIcon /></button>
                    )}
                    <button
                      type="button"
                      className="combo-arrow"
                      tabIndex={-1}
                      onMouseDown={e => {
                        e.preventDefault();
                        setShowSizes(v => !v);
                      }}
                    >▼</button>
                    {showSizes && filteredSizes.length > 0 && (
                      <div className="daily-list-small">
                        {filteredSizes.map((s, i) => (
                          <div
                            key={i}
                            onMouseDown={() => {
                              setSizeInput(s);
                              setShowSizes(false);
                              setVidInput("");
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
                      disabled={!sizeInput || !(bySize[sizeInput] && bySize[sizeInput].length)}
                    />
                    {vidInput && (
                      <button
                        type="button"
                        className="clear-btn"
                        onClick={() => setVidInput("")}
                        tabIndex={-1}
                        aria-label="Очистить поле"
                      ><CrossIcon /></button>
                    )}
                    <button
                      type="button"
                      className="combo-arrow"
                      tabIndex={-1}
                      onMouseDown={e => {
                        e.preventDefault();
                        setShowVids(v => !v);
                      }}
                    >▼</button>
                    {showVids && filteredVids.length > 0 && (
                      <div className="daily-list-small">
                        {filteredVids.map((v, i) => (
                          <div
                            key={i}
                            onMouseDown={() => {
                              setVidInput(v);
                              setShowVids(false);
                            }}
                          >
                            {v}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Количество */}
                  <div className="daily-field" style={{ position: "relative" }}>
                    <label>Количество</label>
                    <input
                      type="number"
                      className="daily-input"
                      min="1"
                      value={kolvo}
                      onChange={(e) => setKolvo(e.target.value)}
                    />
                    {kolvo && (
                      <button
                        type="button"
                        className="clear-btn"
                        onClick={() => setKolvo("")}
                        tabIndex={-1}
                        aria-label="Очистить поле"
                      ><CrossIcon /></button>
                    )}
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
      {editIndex === null && !isDone && (
        <div style={{ marginTop: 18 }}>
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
            />
            {sizeInput && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setSizeInput("")}
                tabIndex={-1}
                aria-label="Очистить поле"
              ><CrossIcon /></button>
            )}
            <button
              type="button"
              className="combo-arrow"
              tabIndex={-1}
              onMouseDown={e => {
                e.preventDefault();
                setShowSizes(v => !v);
              }}
            >▼</button>
            {showSizes && filteredSizes.length > 0 && (
              <div className="daily-list-small">
                {filteredSizes.map((s, i) => (
                  <div
                    key={i}
                    onMouseDown={() => {
                      setSizeInput(s);
                      setShowSizes(false);
                      setVidInput("");
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
              disabled={!sizeInput || !(bySize[sizeInput] && bySize[sizeInput].length)}
            />
            {vidInput && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setVidInput("")}
                tabIndex={-1}
                aria-label="Очистить поле"
              ><CrossIcon /></button>
            )}
            <button
              type="button"
              className="combo-arrow"
              tabIndex={-1}
              onMouseDown={e => {
                e.preventDefault();
                setShowVids(v => !v);
              }}
            >▼</button>
            {showVids && filteredVids.length > 0 && (
              <div className="daily-list-small">
                {filteredVids.map((v, i) => (
                  <div
                    key={i}
                    onMouseDown={() => {
                      setVidInput(v);
                      setShowVids(false);
                    }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Количество */}
          <div className="daily-field" style={{ position: "relative" }}>
            <label>Количество</label>
            <input
              type="number"
              className="daily-input"
              min="1"
              value={kolvo}
              onChange={(e) => setKolvo(e.target.value)}
            />
            {kolvo && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setKolvo("")}
                tabIndex={-1}
                aria-label="Очистить поле"
              ><CrossIcon /></button>
            )}
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
              className="daily-btn-alt daily-btn-small"
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
