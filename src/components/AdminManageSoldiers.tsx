'use client';

import { useState, useEffect } from 'react';
import AdminEditSoldier from './AdminEditSoldier';

interface SoldierListItem {
  id: string;
  name: string;
  personalId: string | null;
  team: { id: string; name: string };
  equipment: { id: string; type: string; serialNumber: string }[];
  _count: { equipment: number };
}

interface TeamOption {
  id: string;
  name: string;
}

export default function AdminManageSoldiers() {
  const [soldiers, setSoldiers] = useState<SoldierListItem[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingSoldierId, setEditingSoldierId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSoldiers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterTeam) params.set('teamId', filterTeam);

      const res = await fetch(`/api/admin/soldiers?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSoldiers(data);
    } catch {
      showToast('שגיאה בטעינת החיילים', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoldiers();
    fetch('/api/teams')
      .then((r) => r.json())
      .then((data) => setTeams(data))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSoldiers();
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterTeam]);

  const handleDelete = async (soldierId: string, soldierName: string) => {
    if (!confirm(`האם למחוק את ${soldierName}? פעולה זו אינה הפיכה.`)) return;

    try {
      const res = await fetch(`/api/admin/soldiers/${soldierId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast(`🗑️ ${soldierName} נמחק`, 'success');
      setEditingSoldierId(null);
      fetchSoldiers();
    } catch {
      showToast('שגיאה במחיקת חייל', 'error');
    }
  };

  const handleSaved = () => {
    showToast('✅ השינויים נשמרו בהצלחה!', 'success');
    fetchSoldiers();
  };

  // If editing a soldier, show the edit view
  if (editingSoldierId) {
    return (
      <>
        {toast && (
          <div className={`toast toast--${toast.type}`}>{toast.message}</div>
        )}
        <AdminEditSoldier
          soldierId={editingSoldierId}
          teams={teams}
          onBack={() => setEditingSoldierId(null)}
          onSaved={handleSaved}
          onDelete={handleDelete}
        />
      </>
    );
  }

  return (
    <div className="manage-soldiers">
      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.message}</div>
      )}

      {/* Search & Filter Bar */}
      <div className="manage-toolbar">
        <input
          type="text"
          className="form-input manage-search"
          placeholder="🔍 חיפוש חייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select manage-filter"
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
        >
          <option value="">כל הצוותים</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Soldiers List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>טוען חיילים...</span>
        </div>
      ) : soldiers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <p>לא נמצאו חיילים</p>
          </div>
        </div>
      ) : (
        <div className="soldier-cards">
          {soldiers.map((soldier) => (
            <div
              key={soldier.id}
              className="soldier-card"
              onClick={() => setEditingSoldierId(soldier.id)}
            >
              <div className="soldier-card__info">
                <div className="soldier-card__name">{soldier.name}</div>
                <div className="soldier-card__meta">
                  🎖️ {soldier.team.name}
                  {soldier.personalId && ` · מס"א: ${soldier.personalId}`}
                </div>
              </div>
              <div className="soldier-card__badge">
                {soldier._count.equipment} פריטים
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
