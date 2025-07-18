import React, { useState, useEffect } from "react";
import "./styles.css";

// SVG-иконки
const PencilIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);
const CrossIcon = () => (
  <svg width="16" height="16" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function StoneDailyReport() {
  const [sheetOptions, setSheetOptions] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [positions, setPositions] = useState([]);
  const [reportDate, setReportDate] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [kolvo, setKolvo] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [vidInput, setVidInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bySize, setBySize] = useState({});
  const [sizes, setSizes] = useState([]);
  const [showSizes, setShowSizes] = useState(false);
  const [showVids, setShowVids] = useState(false);

  // Загружаем список сотрудников (фамилий) и номенклатуру при загрузке
  useEffect(() => {
    async function fetchSheets() {
      const res = await fetch('https://lpaderina.store/webhook/rabotniki');
      const dataSheets = await res.json();
      if (dataSheets.list_name) {
        setSheetOptions(JSON.parse(dataSheets.list_name));
      } else if (Array.isArray(dataSheets) && dataSheets[0]?.list_name) {
        try {
          setSheetOptions(JSON.parse(dataSheets[0].list_name));
        } catch {
          setSheetOptions([]);
        }
      }
    }
    async function fetchNomenclature() {
      const resNomenclature = await fetch('https://lpaderina.store/webhook/nomenklatura');
      const dataNomenclature = await resNomenclature.json();
      setBySize(dataNomenclature.bySize || {});
      setSizes(Object.keys(dataNomenclature.bySize || {}));
    }
    fetchSheets();
    fetchNomenclature();
  }, []);

  // При выборе фамилии подгружаем задания и дату
  const handleSelectSheet = async (e) => {
    const value = e.target.value;
    setSelectedSheet(value);
    setEditIndex(null);
    setIsAdding(false);
    setKolvo("");
    setSizeInput("");
    setVidInput("");
    setPositions([]);
    setReportDate("");

    if (value) {
      const res = await fetch('https://lpaderina.store/webhook/daily_task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet: value }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPositions(data);
          setReportDate(data[0]?.date || "");
        } else {
          setPositions(data.positions || []);
          setReportDate(data.positions?.[0]?.date || "");
        }
      } else {
        setPositions([]);
        setReportDate("");
      }
    }
  };

  // Сохранить новую или отредактированную позицию
  const handleSave = () => {
    if (editIndex !== null && kolvo) {
      const updated = [...positions];
      updated[editIndex] = { ...updated[editIndex], qty: kolvo };
      setPositions(updated);
      setEditIndex(null);
      setKolvo("");
      setIsAdding(false);
    }
    if (editIndex === null && sizeInput && vidInput && kolvo) {
      setPositions([...positions, { size: sizeInput, vid: vidInput, qty: kolvo }]);
      setSizeInput("");
      setVidInput("");
      setKolvo("");
      setIsAdding(false);
    }
  };

  // Для добавления новой позиции
  const handleAddPosition = () => {
    setEditIndex(null);
    setIsAdding(true);
    setSizeInput("");
    setVidInput("");
    setKolvo("");
  };

  // Для редактирования существующей позиции
  const handleEditPosition = (index) => {
    const pos = positions[index];
    setKolvo(pos.qty);
    setEditIndex(index);
    setIsAdding(true);
    setSizeInput(pos.size);
    setVidInput(pos.vid);
  };

  // Удалить позицию
  const handleDeletePosition = (index) => {
    const updated = [...positions];
    updated.splice(index, 1);
    setPositions(updated);
    setEditIndex(null);
    setIsAdding(false);
    setSizeInput("");
    setVidInput("");
    setKolvo("");
  };

  // Отправить данные
  const handleSubmit = async () => {
    const positionsToSend = positions.map(pos => ({
      ...pos,
      qty: Number(pos.qty)
    }));

    await fetch('https://lpaderina.store/webhook/70e744f0-35d8-4252-ba73-25db1d52dbf9', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        positions: positionsToSend,
        sheet: selectedSheet,
        date: reportDate,
      }),
    });
    setShowSuccess(true);
    setPositions([]);
    setEditIndex(null);
    setKolvo("");
    setIsAdding(false);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  // Фильтрация для выпадающих списков
  const filteredSizes = sizes.filter((s) =>
    s.toLowerCase().includes(sizeInput.toLowerCase())
  );
  const currentVidOptions = bySize[sizeInput] || [];
  const filteredVids = currentVidOptions.filter((v) =>
    v.toLowerCase().includes(vidInput.toLowerCase())
  );

  return (
    <div className="daily-form-main">
      {/* Фамилия: select до выбора, read-only после выбора */}
      <div className="daily-title">
        <label>Фамилия</label>
        {!selectedSheet ? (
          <select
            className="daily-input"
            value={selectedSheet}
            onChange={handleSelectSheet}
          >
            <option value="">Фамилия...</option>
            {sheetOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="daily-input"
            value={sheetOptions.find(opt => opt.value === selectedSheet)?.label || selectedSheet}
            readOnly
            style={{ background: "#f1f5f9", color: "#2d3748", fontWeight: 500 }}
          />
        )}
      </div>

      {/* Остальная форма: только если выбрана фамилия */}
      {selectedSheet && (
        <>
          {showSuccess ? (
            <div>
              <div className="daily-title">Дата: {reportDate || "—"}</div>
              <div className="daily-sub" style={{ marginTop: 40, fontSize: 24, textAlign: "center", color: "#22c55e" }}>
                Спасибо за твой труд!
              </div>
            </div>
          ) : (
            <>
              <div className="daily-title">Дата: {reportDate || "—"}</div>
              <div className="daily-sub">Список позиций:</div>

              {/* Показываем подсказку если нет позиций, но дата уже есть */}
              {((!positions.length && reportDate) ||
                (positions.length === 1 && !positions[0].size && !positions[0].vid && !positions[0].qty)) && (
                <div style={{
                  margin: '16px 0',
                  textAlign: 'center',
                  color: '#999',
                  fontSize: 18
                }}>
                  Добавь позиции вручную
                </div>
              )}

              <ul className="daily-list" style={{ marginTop: 14 }}>
                {positions.map((pos, i) => (
                  <React.Fragment key={i}>
                    {(pos.size || pos.vid || pos.qty) && (
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
                    )}
                    {/* Режим редактирования позиции */}
                    {isAdding && editIndex === i && (
                      <li>
                        <div className="daily-edit-form" style={{ marginTop: 8, marginBottom: 10 }}>
                          <div className="daily-field" style={{ position: "relative" }}>
                            <label>Размер</label>
                            <input
                              type="text"
                              className="daily-input"
                              value={positions[i].size}
                              readOnly
                              disabled
                            />
                          </div>
                          <div className="daily-field" style={{ position: "relative" }}>
                            <label>Вид работы</label>
                            <input
                              type="text"
                              className="daily-input"
                              value={positions[i].vid}
                              readOnly
                              disabled
                            />
                          </div>
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
                              disabled={!kolvo}
                            >
                              Сохранить
                            </button>
                            <button
                              className="daily-btn-alt daily-btn-small"
                              style={{ marginLeft: 8 }}
                              onClick={() => { setIsAdding(false); setEditIndex(null); setKolvo(""); }}
                            >
                              Завершить редактирование
                            </button>
                          </div>
                        </div>
                      </li>
                    )}
                  </React.Fragment>
                ))}
                {/* Форма добавления новой позиции */}
                {isAdding && editIndex === null && (
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
                          onClick={() => { setIsAdding(false); setEditIndex(null); setKolvo(""); }}
                        >
                          Завершить редактирование
                        </button>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
              {!isAdding && (
                <div className="daily-flex" style={{ marginTop: 18 }}>
                  <button
                    className="daily-btn-main"
                    onClick={handleAddPosition}
                  >
                    Добавить позицию
                  </button>
                  <button
                    className="daily-btn-alt daily-btn-small"
                    style={{ marginLeft: 8 }}
                    onClick={handleSubmit}
                    disabled={positions.length === 0}
                  >
                    Отправить данные
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
