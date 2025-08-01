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
