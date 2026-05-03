'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatTimestamp, getToday, formatDateDisplay } from '@/lib/utils';

interface SoldierStatus {
  soldierId: string;
  soldierName: string;
  personalId: string | null;
  equipmentCount: number;
  verified: boolean;
  verificationTime: string | null;
}

interface TeamStatus {
  teamId: string;
  teamName: string;
  soldiers: SoldierStatus[];
  verifiedCount: number;
  totalCount: number;
}

interface StatusData {
  date: string;
  intervalHours: number;
  teams: TeamStatus[];
  summary: {
    totalSoldiers: number;
    totalVerified: number;
  };
}

export default function AdminDashboard() {
  const [date, setDate] = useState(getToday());
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (selectedDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/status?date=${selectedDate}`);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.reload();
          return;
        }
        throw new Error('Failed to fetch');
      }
      const statusData = await res.json();
      setData(statusData);
    } catch {
      setError('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus(date);
  }, [date, fetchStatus]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus(date);
    }, 30000);
    return () => clearInterval(interval);
  }, [date, fetchStatus]);

  return (
    <>
      <header className="app-header">
        <h1 className="app-header__title">לוח בקרה — מפקד</h1>
        <p className="app-header__subtitle">ניהול בדיקת צל״ם</p>
      </header>

      <main className="page-container page-container--wide">
        {/* Header with date picker */}
        <div className="admin-header">
          <h2 className="admin-header__title">
            סטטוס אימות — {formatDateDisplay(date)}
          </h2>
          <div className="date-picker-row">
            <input
              id="date-filter"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button
              className="btn btn--secondary btn--small"
              onClick={() => setDate(getToday())}
            >
              היום
            </button>
            <button
              className="btn btn--secondary btn--small"
              onClick={() => fetchStatus(date)}
              title="רענן"
            >
              🔄
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>טוען נתונים...</span>
          </div>
        ) : error ? (
          <div className="card">
            <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>
          </div>
        ) : data ? (
          <>
            {/* Summary Stats */}
            <div className="admin-stats">
              <div className="stat-card">
                <div className="stat-card__value">{data.summary.totalSoldiers}</div>
                <div className="stat-card__label">סה״כ חיילים</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value stat-card__value--success">
                  {data.summary.totalVerified}
                </div>
                <div className="stat-card__label">אימתו ✅</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value stat-card__value--danger">
                  {data.summary.totalSoldiers - data.summary.totalVerified}
                </div>
                <div className="stat-card__label">ממתינים ❌</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value">
                  {data.summary.totalSoldiers > 0
                    ? Math.round(
                        (data.summary.totalVerified / data.summary.totalSoldiers) * 100
                      )
                    : 0}
                  %
                </div>
                <div className="stat-card__label">אחוז השלמה</div>
              </div>
            </div>

            {/* Team Sections */}
            {data.teams.map((team) => (
              <div key={team.teamId} className="team-section">
                <div className="team-section__header">
                  <span className="team-section__name">🎖️ {team.teamName}</span>
                  <span className="team-section__progress">
                    {team.verifiedCount}/{team.totalCount}
                  </span>
                </div>
                <div className="team-section__progress-bar">
                  <div
                    className="team-section__progress-fill"
                    style={{
                      width:
                        team.totalCount > 0
                          ? `${(team.verifiedCount / team.totalCount) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
                <div className="team-section__body">
                  {team.soldiers.map((soldier) => (
                    <div key={soldier.soldierId} className="soldier-row">
                      <div>
                        <div className="soldier-row__name">{soldier.soldierName}</div>
                        <div className="soldier-row__meta">
                          {soldier.personalId && `מס"א: ${soldier.personalId} · `}
                          {soldier.equipmentCount} פריטים
                        </div>
                      </div>
                      <div className="soldier-row__status">
                        {soldier.verified ? (
                          <>
                            <span className="status-badge status-badge--verified">
                              ✅ אומת
                            </span>
                            {soldier.verificationTime && (
                              <span className="verification-time">
                                {formatTimestamp(soldier.verificationTime)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="status-badge status-badge--pending">
                            ❌ ממתין
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : null}
      </main>
    </>
  );
}
