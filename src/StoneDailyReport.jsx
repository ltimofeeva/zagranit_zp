import React, { useState, useEffect } from "react";
import "./styles.css";

// SVG-иконки (без изменений)
const PencilIcon = () => (/* ... */);
const TrashIcon = () => (/* ... */);
const CrossIcon = () => (/* ... */);

const getToday = () => {
  const d = new Date();
  return d.toLocaleDateString("ru-RU");
};

export default function StoneDailyReport() {
  const [positions, setPositions] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [kolvo, setKolvo] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [vidInput, setVidInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sheetOptions, setSheetOptions] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [bySize, setBySize] = useState({});
  const [sizes, setSizes] = useState([]);
  const [showSizes, setShowSizes] = useState(false);
  const [showVids, setShowVids] = useState(false);
  const [reportDate, setReportDate] = useState(getToday()); // Дата для отчёта
  const [chatId, setChatId] = useState(null);


  // Получить дату по вебхуку при загрузке страницы
  const fetchReportDate = async () => {
    try {
      const res = await fetch('https://lpaderina.store/webhook/get_current_date');
      const data = await res.json();
      if (data.date) setReportDate(data.date);
    } catch (e) {
      setReportDate(getToday());
    }
  };

  // Получаем список сотрудников и номенклатуру
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const cid = params.get("chat_id");
  if (cid) setChatId(cid);

    async function fetchInitialData() {
      // Номенклатура
      const resNomenclature = await fetch('https://lpaderina.store/webhook/nomenklatura');
      const dataNomenclature = await resNomenclature.json();
      setBySize(dataNomenclature.bySize || {});
      setSizes(Object.keys(dataNomenclature.bySize || {}));

      // Сотрудники
      const resSheets = await fetch('https://lpaderina.store/webhook/rabotniki');
      const dataSheets = await resSheets.json();
      if (dataSheets.list_name) {
        const parsed = JSON.parse(dataSheets.list_name);
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
    fetchReportDate(); // подгружаем дату при открытии формы
  }, []);

  // Выбор фамилии: запрашиваем задание и (если есть) новую дату
  const handleSelectSheet = async (e) => {
    const value = e.target.value;
    setSelectedSheet(value);
    setPositions([]);
    setEditIndex(null);
    setIsAdding(false);

    if (value) {
      const res = await fetch('https://lpaderina.store/webhook/daily_task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet: value }),
      });

      if (res.ok) {
        const data = await res.json();
        // Если воркфлоу возвращает объект {positions: [...], date: "..."}
        if (data.date) setReportDate(data.date);
        if (data.positions) setPositions(data.positions);
        else setPositions(data || []);
      } else {
        setPositions([]);
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
    // qty гарантированно число
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
        date: reportDate, // отправляем актуальную дату
        chat_id: chatId 
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

  // Блок "Спасибо за труд"
  if (showSuccess) {
    return (
      <div className="daily-form-main">
        <div className="daily-title">Дата — {reportDate}</div>
        <div className="daily-sub" style={{ marginTop: 40, fontSize: 24, textAlign: "center", color: "#22c55e" }}>
          Спасибо за твой труд!
        </div>
      </div>
    );
  }

  // --- ПЕРВЫЙ ЭКРАН: только дата и фамилия ---
  if (!selectedSheet) {
    return (
      <div className="daily-form-main">
        <div className="daily-title">Дата — {reportDate}</div>
        <div className="daily-field">
          <label>Фамилия</label>
          <select
            className="daily-input"
            value={selectedSheet}
            onChange={handleSelectSheet}
          >
            <option value="">Выберите фамилию...</option>
            {sheetOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // --- ОСНОВНОЙ ЭКРАН: фамилия выбрана, показываем позиции и кнопки ---
  return (
    <div className="daily-form-main">
      <div className="daily-title">Дата — {reportDate}</div>
      <div className="daily-field">
        <label>Фамилия</label>
        <select
          className="daily-input"
          value={selectedSheet}
          onChange={handleSelectSheet}
        >
          <option value="">Выберите фамилию...</option>
          {sheetOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="daily-sub">Список позиций:</div>
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
            {/* Режим редактирования позиции */}
            {isAdding && editIndex === i && (
              <li>
                <div className="daily-edit-form" style={{ marginTop: 8, marginBottom: 10 }}>
                  {/* Размер (readOnly) */}
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
                  {/* Вид работы (readOnly) */}
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
                  {/* Количество (редактируемое) */}
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
                  onClick={() => { setIsAdding(false); setEditIndex(null); setKolvo(""); }}
                >
                  Завершить редактирование
                </button>
              </div>
            </div>
          </li>
        )}
      </ul>
      {/* Кнопки под списком */}
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
    </div>
  );
}
