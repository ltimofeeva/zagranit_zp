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
  const [editIndex, setEditIndex] = useState(null);
  const [kolvo, setKolvo] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wasDoneBeforeEdit, setWasDoneBeforeEdit] = useState(false);
  const [sheetOptions, setSheetOptions] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");

  // Получение списка сотрудников
  useEffect(() => {
    async function fetchInitialData() {
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
  }, []);

  // Загрузка задания на сегодня по выбранной фамилии
  useEffect(() => {
    if (!selectedSheet) {
      setPositions([]);
      return;
    }
    async function loadAssignment() {
      const today = new Date();
      const dateString = today.toLocaleDateString("ru-RU");
      // Здесь укажи правильный URL твоего backend!
      const res = await fetch(
        `https://lpaderina.store/webhook-test/daily_task`
      );
      if (res.ok) {
        const data = await res.json();
        setPositions(data || []);
      } else {
        setPositions([]);
      }
    }
    loadAssignment();
  }, [selectedSheet]);

  // Сохраняем изменения количества
  const handleSave = () => {
    if (editIndex !== null && kolvo) {
      const updated = [...positions];
      updated[editIndex] = { ...updated[editIndex], qty: kolvo };
      setPositions(updated);
      setEditIndex(null);
      setKolvo("");
      if (wasDoneBeforeEdit) {
        setIsDone(true);
        setWasDoneBeforeEdit(false);
      }
    }
  };

  const handleEditPosition = (index) => {
    const pos = positions[index];
    setKolvo(pos.qty);
    setEditIndex(index);
    setIsDone(false);
    setWasDoneBeforeEdit(isDone);
  };

  const handleDeletePosition = (index) => {
    const updated = [...positions];
    updated.splice(index, 1);
    setPositions(updated);
    if (editIndex === index) {
      setEditIndex(null);
      setKolvo("");
    }
  };

  const handleFinish = () => {
    setIsDone(true);
    setEditIndex(null);
    setKolvo("");
  };

  const handleReturnToEdit = () => {
    setIsDone(false);
    setShowSuccess(false);
  };

  const handleSubmit = async () => {
    await fetch('https://lpaderina.store/webhook/70e744f0-35d8-4252-ba73-25db1d52dbf9', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions, sheet: selectedSheet }),
    });
    setShowSuccess(true);
    setPositions([]);
    setIsDone(false);
    setEditIndex(null);
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

  // Основной режим: список позиций, редактирование только количества
  return (
    <div className="daily-form-main">
      <div className="daily-title">Дата — {getToday()}</div>
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
                  {/* Размер (только для чтения) */}
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
                  {/* Вид работы (только для чтения) */}
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
                  {/* Количество (доступно для редактирования) */}
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
                  </div>
                </div>
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
      {/* Кнопка "Завершить редактирование" */}
      <div className="daily-flex" style={{ marginTop: 18 }}>
        <button
          className="daily-btn-alt daily-btn-small"
          style={{ marginLeft: 0 }}
          onClick={handleFinish}
          disabled={positions.length === 0}
        >
          Завершить редактирование
        </button>
      </div>
    </div>
  );
}
