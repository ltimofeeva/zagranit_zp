import React, { useState } from "react";
import "./styles.css";

const VIDS = ["Матовая", "Глянцевая", "Бучард", "Сатин", "Антик", "Термо"];
const SIZES = ["60x30", "80x40", "100x60", "50x50", "120x60", "40x20", "100x100"];

const getToday = () => {
  const d = new Date();
  return d.toLocaleDateString("ru-RU");
};

export default function StoneDailyReport() {
  const [positions, setPositions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [vidInput, setVidInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [kolvo, setKolvo] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const yesterdayPositions = [
    { vid: "Матовая", size: "60x30", qty: 12 },
    { vid: "Глянцевая", size: "80x40", qty: 5 },
  ];

  const filteredVids = VIDS.filter((v) =>
    v.toLowerCase().includes(vidInput.toLowerCase())
  );
  const filteredSizes = SIZES.filter((s) =>
    s.toLowerCase().includes(sizeInput.toLowerCase())
  );

  const handleAddPosition = () => {
    if (!vidInput || !sizeInput || !kolvo) return;
    setPositions([...positions, { vid: vidInput, size: sizeInput, qty: kolvo }]);
    setVidInput("");
    setSizeInput("");
    setKolvo("");
  };

  const handleUseYesterday = () => {
    setPositions(yesterdayPositions);
    setIsFinished(true);
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
  // positions — твой массив с данными
  try {
    const response = await fetch('https://lpaderina.store/webhook-test/70e744f0-35d8-4252-ba73-25db1d52dbf9', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions }),
    });
    if (response.ok) {
      alert('Данные успешно отправлены!');
      // Сбросить форму, если надо
    } else {
      alert('Ошибка при отправке!');
    }
  } catch (e) {
    alert('Ошибка сети!');
  }
};

  return (
    <div className="daily-form-main">
      <div className="daily-title">Дата — {getToday()}</div>
      <div className="daily-sub">Позиции за вчера:</div>
      <ul className="daily-list">
        {yesterdayPositions.map((pos, i) => (
          <li key={i}>
            <span>{pos.vid} — {pos.size} — {pos.qty} шт.</span>
          </li>
        ))}
      </ul>
      {!showForm && (
        <button className="daily-btn-main" onClick={handleUseYesterday}>
          Использовать значения
        </button>
      )}
      <div className="daily-or">или</div>
      {!showForm && (
        <button className="daily-btn-alt" onClick={() => setShowForm(true)}>
          Добавить новые
        </button>
      )}
      {showForm && !isFinished && (
        <div>
          <div style={{ margin: "22px 0 10px 0", fontWeight: 600, color: "#333" }}>
            Добавление позиции
          </div>
          {/* Вид полировки */}
          <div className="daily-field">
            <label>Вид</label>
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
              disabled={!vidInput || !sizeInput || !kolvo}
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
                      {pos.vid} — {pos.size} — {pos.qty} шт.
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {(isFinished || (!showForm && positions.length > 0)) && (
        <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 25, paddingTop: 18 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Проверьте данные:</div>
          <ul className="daily-list">
            {positions.map((pos, i) => (
              <li key={i}>
                <span>
                  {pos.vid} — {pos.size} — {pos.qty} шт.
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
