'use client';

import { useState, useEffect } from 'react';

interface EquipmentItem {
  id: string;
  type: string;
  serialNumber: string;
}

interface EquipmentChecklistProps {
  soldier: { id: string; name: string; personalId: string | null };
  teamName: string;
  onComplete: (result: {
    timestamp: string;
    soldierName: string;
    teamName: string;
  }) => void;
}

export default function EquipmentChecklist({
  soldier,
  teamName,
  onComplete,
}: EquipmentChecklistProps) {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/equipment?soldierId=${soldier.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: EquipmentItem[]) => {
        setEquipment(data);
        // Initialize all as unchecked
        const initial: Record<string, boolean> = {};
        data.forEach((item: EquipmentItem) => {
          initial[item.id] = false;
        });
        setVerified(initial);
        setLoading(false);
      })
      .catch(() => {
        setError('שגיאה בטעינת הציוד');
        setLoading(false);
      });
  }, [soldier.id]);

  const allVerified =
    equipment.length > 0 &&
    equipment.every((item) => verified[item.id] === true);

  const verifiedCount = Object.values(verified).filter(Boolean).length;

  const toggleAll = () => {
    const allChecked = equipment.every((item) => verified[item.id]);
    const newState: Record<string, boolean> = {};
    equipment.forEach((item) => {
      newState[item.id] = !allChecked;
    });
    setVerified(newState);
  };

  const handleSubmit = async () => {
    if (!allVerified) return;

    setSubmitting(true);
    setError(null);

    try {
      const items = equipment.map((item) => ({
        equipmentId: item.id,
        equipmentType: item.type,
        serialNumber: item.serialNumber,
        verified: true,
      }));

      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soldierId: soldier.id,
          items,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      const data = await res.json();
      onComplete({
        timestamp: data.verification.timestamp,
        soldierName: data.verification.soldierName,
        teamName: data.verification.teamName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשליחת האימות');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>טוען ציוד...</span>
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state__icon">📦</div>
          <p>לא נמצא ציוד רשום עבור {soldier.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card__title">
        <span className="card__title-icon">📋</span>
        אימות ציוד — {soldier.name}
      </h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-md)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          {teamName} • {verifiedCount}/{equipment.length} פריטים
        </span>
        <button
          className="btn btn--secondary btn--small"
          onClick={toggleAll}
        >
          {allVerified ? 'בטל הכל' : 'סמן הכל'}
        </button>
      </div>

      <div className="checklist">
        {equipment.map((item) => (
          <label
            key={item.id}
            className={`checklist-item ${
              verified[item.id] ? 'checklist-item--verified' : ''
            }`}
          >
            <div className="checklist-item__info">
              <div className="checklist-item__type">{item.type}</div>
              <div className="checklist-item__serial">{item.serialNumber}</div>
            </div>
            <div className="toggle">
              <input
                type="checkbox"
                checked={verified[item.id] || false}
                onChange={() =>
                  setVerified((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }))
                }
              />
              <span className="toggle__slider" />
            </div>
          </label>
        ))}
      </div>

      {error && (
        <div className="login-error" style={{ marginTop: 'var(--space-md)' }}>
          {error}
        </div>
      )}

      <button
        className="btn btn--primary"
        style={{ marginTop: 'var(--space-xl)' }}
        disabled={!allVerified || submitting}
        onClick={handleSubmit}
      >
        {submitting ? (
          <>
            <div className="spinner" />
            שולח...
          </>
        ) : (
          <>✅ שלח אימות</>
        )}
      </button>
    </div>
  );
}
