'use client';

import { useState, useEffect } from 'react';

interface Team {
  id: string;
  name: string;
  _count: {
    soldiers: number;
  };
}

interface TeamSelectorProps {
  onSelect: (team: { id: string; name: string }) => void;
}

export default function TeamSelector({ onSelect }: TeamSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/teams')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setTeams(data);
        setLoading(false);
      })
      .catch(() => {
        setError('שגיאה בטעינת הצוותים');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>טוען צוותים...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card__title">
        <span className="card__title-icon">🎖️</span>
        בחר צוות
      </h2>
      <div className="form-group">
        <label className="form-label" htmlFor="team-select">צוות / כיתה</label>
        <select
          id="team-select"
          className="form-select"
          defaultValue=""
          onChange={(e) => {
            const team = teams.find((t) => t.id === e.target.value);
            if (team) onSelect({ id: team.id, name: team.name });
          }}
        >
          <option value="" disabled>
            — בחר צוות —
          </option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} ({team._count.soldiers} חיילים)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
