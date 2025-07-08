import React, { useState, useEffect } from "react";
import "./styles.css";

export default function StoneDailyReport() {
  // Справочники из backend
  const [sizes, setSizes] = useState([]);
  const [vids, setVids] = useState([]);
  // Выбранные значения
  const [positions, setPositions] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [vidInput, setVidInput] = useState("");
  const [kolvo, setKolvo] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Получаем справочники с backend при загрузке формы
  useEffect(() => {
    async function fetchNomenclature() {
      const res = await fetch('https://your-backend/nomenclature'); // твой endpoint!
      const data = await res.json();
      setSizes(data.sizes || []);
      setVids(data.vids || []);
    }
    fetchNomenclature();
  }, []);

  const filteredSizes = sizes.filter((s) =>
    s.toLowerCase().includes(sizeInput.toLowerCase())
  );
  const filteredVids = vids.filter((v) =>
    v.toLowerCase().includes(vidInput.toLowerCase())
  );

  const handleAddPosition = () => {
    if (!sizeInput || !vidInput || !kolvo) return;
    setPositions([...positions, { size: sizeInput, vid: vidInput, qty: kolvo }]);
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
    await fetch('https://your-n8n/webhook/stone-daily', {
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
      <div className="daily-title">Форма ввода работ</div>
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
              onChange={(e) => setSizeInput(e.target.value)}
              disabled={isFinished && !isEditing}
            />
            {sizeInput && filteredSizes.length > 0 && (
              <div className="daily-list-small">
                {filteredSizes.map((s, i) => (
                  <div key={i} onClick={() => setSizeInput(s)}>
                    {s}
                  </div>
                ))}
              </div>
            )}
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
              disabled={isFinished && !isEditing}
            />
            {vidInput && filteredVids.length > 0 && (
              <div className="daily-list-small">
                {filteredVids.map((v, i) => (
                  <div key={i} onClick={() => setVidInput(v)}>
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
                      {pos.size} — {pos.vid} — {pos.qty} шт.
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
                  {pos.size} — {pos.vid} — {pos.qty} шт.
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
