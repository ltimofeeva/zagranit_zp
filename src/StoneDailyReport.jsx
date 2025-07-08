import React, { useState, useEffect } from "react";
import "./styles.css";

// SVG-иконки (карандаш, мусорка, крестик)
const PencilIcon = () => (
  <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

const CrossIcon = () => (
  <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
  const [afterEditInDoneMode, setAfterEditInDoneMode] = useState(false);

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

  const resetFields = () => {
    setSizeInput("");
    setVidInput("");
    setKolvo("");
    setEditIndex(null);
    setShowSizes(false);
    setShowVids(false);
  };

  // Добавление или редактирование позиции
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
      setAfterEditInDoneMode(isDone);
      resetFields();
    } else {
      setPositions([...positions, item]);
      resetFields();
    }
  };

  // Начать редактировать выбранную позицию
  const handleEditPosition = (index) => {
    const pos = positions[index];
    setSizeInput(pos.size);
    setVidInput(pos.vid);
    setKolvo(pos.qty);
    setEditIndex(index);
    setAfterEditInDoneMode(false);
  };

  const handleDeletePosition = (index) => {
    const updated = [...positions];
    updated.splice(index, 1);
    setPositions(updated);
    if (editIndex === index) resetFields();
  };

  // Завершить редактирование — переход к отправке
  const handleFinish = () => {
    setIsDone(true);
    resetFields();
    setAfterEditInDoneMode(false);
  };

  const handleReturnToEdit = () => {
    setIsDone(false);
    setShowSuccess(false);
    setAfterEditInDoneMode(false);
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
    resetFields();
    setTimeout(() => setShowSuccess(false), 4000);
  };

  // --- КОНЕЦ ФУНКЦИЙ ---

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

  // Если завершено редактирование или после редактирования из doneMode
  if (isDone || afterEditInDoneMode) {
    return (
      <div className="daily-form-main">
        <div className="daily-title">Дата — {getToday()}</div>
        <div className="daily-sub">Введённые позиции:</div>
        <ul className="daily-list" style={{ marginTop: 14 }}>
          {positions.map((pos, i) => (
            <li key={i} className="position-row">
              <span>
                {pos.size} {pos.vid} — {pos.qty} шт.
              </span>
              <span className="row-icons">
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
          ))}
        </ul>
        <div className="daily-flex" style={{ marginTop: 30, gap: 12 }}>
          <button
            className="daily-btn-green"
            onClick={handleReturnToEdit}
          >
            Вернуться к редактированию
          </button>
          <button
            className="daily-btn-green"
            onClick={handleSubmit}
            disabled={positions.length === 0}
          >
            Отправить данные
          </button>
        </div>
        {/* Предзаполненная форма для редактирования, если она сейчас открыта */}
        {editIndex !== null && (
          <div style={{ marginTop: 18 }}>
            <EditForm
              sizeInput={sizeInput}
              setSizeInput={setSizeInput}
              showSizes={showSizes}
              setShowSizes={setShowSizes}
              filteredSizes={filteredSizes}
              vidInput={vidInput}
              setVidInput={setVidInput}
              showVids={showVids}
              setShowVids={setShowVids}
              filteredVids={filteredVids}
              kolvo={kolvo}
              setKolvo={setKolvo}
              onSave={handleSave}
              onCancel={resetFields}
              bySize={bySize}
              sizes={sizes}
              mode="edit"
            />
          </div>
        )}
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
            <li className="position-row">
              <span>
                {pos.size} {pos.vid} — {pos.qty} шт.
              </span>
              <span className="row-icons">
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
                <EditForm
                  sizeInput={sizeInput}
                  setSizeInput={setSizeInput}
                  showSizes={showSizes}
                  setShowSizes={setShowSizes}
                  filteredSizes={filteredSizes}
                  vidInput={vidInput}
                  setVidInput={setVidInput}
                  showVids={showVids}
                  setShowVids={setShowVids}
                  filteredVids={filteredVids}
                  kolvo={kolvo}
                  setKolvo={setKolvo}
                  onSave={handleSave}
                  onCancel={resetFields}
                  bySize={bySize}
                  sizes={sizes}
                  mode="edit"
                />
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
      {/* Форма добавления новой позиции (только если не редактируем) */}
      {editIndex === null && (
        <div style={{ marginTop: 18 }}>
          <EditForm
            sizeInput={sizeInput}
            setSizeInput={setSizeInput}
            showSizes={showSizes}
            setShowSizes={setShowSizes}
            filteredSizes={filteredSizes}
            vidInput={vidInput}
            setVidInput={setVidInput}
            showVids={showVids}
            setShowVids={setShowVids}
            filteredVids={filteredVids}
            kolvo={kolvo}
            setKolvo={setKolvo}
            onSave={handleSave}
            onCancel={resetFields}
            bySize={bySize}
            sizes={sizes}
            mode="add"
          />
          <div className="daily-flex" style={{ marginTop: 18 }}>
            <button
              className="daily-btn-green"
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

// --- Универсальная форма для добавления/редактирования позиции ---
function EditForm({
  sizeInput, setSizeInput, showSizes, setShowSizes, filteredSizes,
  vidInput, setVidInput, showVids, setShowVids, filteredVids,
  kolvo, setKolvo, onSave, onCancel, bySize, sizes, mode
}) {
  return (
    <div className="daily-edit-form">
      {/* Размер */}
      <div className="daily-field field-flex">
        <label>Размер</label>
        <div className="input-wrap">
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
              className="clear-btn-form"
              onClick={() => setSizeInput("")}
              tabIndex={-1}
              aria-label="Очистить поле"
            ><CrossIcon /></button>
          )}
          <button
            type="button"
            className="combo-arrow"
            onMouseDown={e => {
              e.preventDefault();
              setShowSizes(v => !v);
            }}
            tabIndex={-1}
          >▼</button>
        </div>
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
                style={{ padding: "8px 12px", cursor: "pointer" }}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Вид работы */}
      <div className="daily-field field-flex">
        <label>Вид работы</label>
        <div className="input-wrap">
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
              className="clear-btn-form"
              onClick={() => setVidInput("")}
              tabIndex={-1}
              aria-label="Очистить поле"
            ><CrossIcon /></button>
          )}
          <button
            type="button"
            className="combo-arrow"
            onMouseDown={e => {
              e.preventDefault();
              setShowVids(v => !v);
            }}
            tabIndex={-1}
          >▼</button>
        </div>
        {showVids && filteredVids.length > 0 && (
          <div className="daily-list-small">
            {filteredVids.map((v, i) => (
              <div
                key={i}
                onMouseDown={() => {
                  setVidInput(v);
                  setShowVids(false);
                }}
                style={{ padding: "8px 12px", cursor: "pointer" }}
              >
                {v}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Количество */}
      <div className="daily-field field-flex">
        <label>Количество</label>
        <div className="input-wrap">
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
              className="clear-btn-form"
              onClick={() => setKolvo("")}
              tabIndex={-1}
              aria-label="Очистить поле"
            ><CrossIcon /></button>
          )}
        </div>
      </div>
      <div className="daily-flex" style={{ marginTop: 10 }}>
        <button
          className="daily-btn-blue"
          onClick={onSave}
          disabled={!sizeInput || !vidInput || !kolvo}
          style={{ marginRight: 8 }}
        >
          Сохранить
        </button>
        {mode === "edit" && (
          <button
            className="daily-btn-blue"
            onClick={onCancel}
            style={{ marginLeft: 0 }}
          >
            Отмена
          </button>
        )}
      </div>
    </div>
  );
}
