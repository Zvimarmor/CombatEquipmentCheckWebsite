'use client';

import { formatTimestamp } from '@/lib/utils';

interface VerificationSuccessProps {
  result: {
    timestamp: string;
    soldierName: string;
    teamName: string;
  };
  onReset: () => void;
}

export default function VerificationSuccess({
  result,
  onReset,
}: VerificationSuccessProps) {
  return (
    <div className="card card--glow">
      <div className="success-screen">
        <div className="success-screen__icon">
          <svg viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="success-screen__title">האימות הושלם!</h2>
        <p className="success-screen__subtitle">
          {result.soldierName} — {result.teamName}
        </p>

        <div className="success-screen__detail">
          🕐 {formatTimestamp(result.timestamp)}
        </div>

        <button
          className="btn btn--secondary"
          style={{ marginTop: 'var(--space-xl)' }}
          onClick={onReset}
        >
          🔄 אימות חייל נוסף
        </button>
      </div>
    </div>
  );
}
