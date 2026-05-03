'use client';

import { useState, FormEvent } from 'react';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהתחברות');
      setLoading(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <h1 className="app-header__title">לוח בקרה — מפקד</h1>
        <p className="app-header__subtitle">ניהול בדיקת צל״ם</p>
      </header>

      <div className="login-container">
        <div className="card login-card">
          <div className="login-card__icon">🔐</div>
          <h2 className="login-card__title">הזדהות מפקד</h2>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">
                סיסמה
              </label>
              <input
                id="admin-password"
                type="password"
                className="form-input"
                placeholder="הזן סיסמת מפקד"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn--amber"
              style={{ width: '100%' }}
              disabled={!password || loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  מתחבר...
                </>
              ) : (
                '🔓 כניסה'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
