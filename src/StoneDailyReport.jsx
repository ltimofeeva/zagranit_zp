import React, { useState, useEffect } from "react";
import "./styles.css";

// SVG-иконки (карандаш, мусорка, крестик)
const PencilIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CrossIcon = () => (
  <svg width="16" height="16" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
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

  const filteredSizes = sizes.filter((s) => s.toLowerCase().includes(sizeInput.toLowerCase()));
  const currentVidOptions = bySize[sizeInput] || [];
  const filteredVids = currentVidOptions.filter((v) => v.toLowerCase().includes(vidInput.toLowerCase()));

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
      return;
    }

    setPositions([...positions, item]);
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

  const renderField = (label, value, setValue, showList, setShowList, list, disabled = false) => (
    <div className="daily-field" style={{ position: "relative" }}>
      <label>{label}</label>
      <input
        type={label === "Количество" ? "number" : "text"}
        className="daily-input"
        placeholder="Начните вводить или выберите..."
        value={value}
        onChange={e => {
          setValue(e.target.value);
          if (label !== "Количество") {
            setShowList(true);
            if (label === "Размер") setVidInput("");
          }
        }}
        onFocus={() => setShowList(true)}
        onBlur={() => setTimeout(() => setShowList(false), 100)}
        autoComplete="off"
        disabled={disabled}
        min={label === "Количество" ? 1 : undefined}
      />
      {value && (
        <button
          type="button"
          className="clear-btn"
          onClick={() => setValue("")}
          tabIndex={-1}
          aria-label="Очистить поле"
        >
          <CrossIcon />
        </button>
      )}
      {label !== "Количество" && (
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
            setShowList(v => !v);
          }}
        >▼</button>
      )}
      {showList && list.length > 0 && (
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
          {list.map((item, i) => (
            <div
              key={i}
              onMouseDown={() => {
                setValue(item);
                setShowList(false);
                if (label === "Размер") setVidInput("");
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer"
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div style={{ marginTop: 18 }}>
      {renderField("Размер", sizeInput, setSizeInput, showSizes, setShowSizes, filteredSizes)}
      {renderField("Вид работы", vidInput, setVidInput, showVids, setShowVids, filteredVids, !sizeInput || !(bySize[sizeInput] && bySize[sizeInput].length))}
      {renderField("Количество", kolvo, setKolvo, () => {}, () => {}, [])}
      <div className="daily-flex">
        <button
          className="daily-btn-main"
          onClick={handleSave}
          disabled={!sizeInput || !vidInput || !kolvo}
        >
          Сохранить
        </button>
        {editIndex === null && (
          <button
            className="daily-btn-alt"
            style={{ marginLeft: 8 }}
            onClick={handleFinish}
            disabled={positions.length === 0}
          >
            Завершить редактирование
          </button>
        )}
      </div>
    </div>
  );

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

  if (isDone) {
    return (
      <div className="daily-form-main">
        <div className="daily-title">Дата — {getToday()}</div>
        <div className="daily-sub">Введённые позиции:</div>
        <ul className="daily-list" style={{ marginTop: 14 }}>
          {positions.map((pos, i) => (
            <li key={i}>
              <span>{pos.size} {pos.vid} — {pos.qty} шт.</span>
              <span style={{ display: "flex", gap: 8 }}>
                <button className="icon-btn" onClick={() => { setIsDone(false); handleEditPosition(i); }}><PencilIcon /></button>
                <button className="icon-btn" onClick={() => handleDeletePosition(i)}><TrashIcon /></button>
              </span>
            </li>
          ))}
        </ul>
        <div className="daily-flex" style={{ marginTop: 30 }}>
          <button className="daily-btn-alt" onClick={handleReturnToEdit}>Вернуться к редактированию</button>
          <button className="daily-btn-main" style={{ marginLeft: 12 }} onClick={handleSubmit} disabled={positions.length === 0}>Отправить данные</button>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-form-main">
      <div className="daily-title">Дата — {getToday()}</div>
      <div className="daily-sub">Введите позиции!</div>
      <ul className="daily-list" style={{ marginTop: 14 }}>
        {positions.map((pos, i) => (
          <React.Fragment key={i}>
            <li>
              <span>{pos.size} {pos.vid} — {pos.qty} шт.</span>
              <span style={{ display: "flex", gap: 8 }}>
                <button className="icon-btn" onClick={() => handleEditPosition(i)}><PencilIcon /></button>
                <button className="icon-btn" onClick={() => handleDeletePosition(i)}><TrashIcon /></button>
              </span>
            </li>
            {editIndex === i && <li>{renderForm()}</li>}
          </React.Fragment>
        ))}
      </ul>
      {editIndex === null && renderForm()}
    </div>
  );
}
