'use client';

import { useState } from 'react';
import TeamSelector from '@/components/TeamSelector';
import SoldierSelector from '@/components/SoldierSelector';
import EquipmentChecklist from '@/components/EquipmentChecklist';
import VerificationSuccess from '@/components/VerificationSuccess';

type Step = 'team' | 'soldier' | 'checklist' | 'success';

interface SelectedTeam {
  id: string;
  name: string;
}

interface SelectedSoldier {
  id: string;
  name: string;
  personalId: string | null;
}

interface VerificationResult {
  timestamp: string;
  soldierName: string;
  teamName: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>('team');
  const [selectedTeam, setSelectedTeam] = useState<SelectedTeam | null>(null);
  const [selectedSoldier, setSelectedSoldier] = useState<SelectedSoldier | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const stepNumber = { team: 1, soldier: 2, checklist: 3, success: 4 }[step];

  const handleTeamSelect = (team: SelectedTeam) => {
    setSelectedTeam(team);
    setSelectedSoldier(null);
    setStep('soldier');
  };

  const handleSoldierSelect = (soldier: SelectedSoldier) => {
    setSelectedSoldier(soldier);
    setStep('checklist');
  };

  const handleVerificationComplete = (result: VerificationResult) => {
    setVerificationResult(result);
    setStep('success');
  };

  const handleReset = () => {
    setStep('team');
    setSelectedTeam(null);
    setSelectedSoldier(null);
    setVerificationResult(null);
  };

  const handleBack = () => {
    if (step === 'soldier') {
      setStep('team');
      setSelectedTeam(null);
    } else if (step === 'checklist') {
      setStep('soldier');
      setSelectedSoldier(null);
    }
  };

  return (
    <>
      <header className="app-header">
        <h1 className="app-header__title">בדיקת צל״ם</h1>
        <p className="app-header__subtitle">אימות ציוד קרבי</p>
      </header>

      <main className="page-container">
        {/* Progress Stepper */}
        <div className="stepper">
          {[1, 2, 3, 4].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                className={`stepper__step ${
                  s === stepNumber
                    ? 'stepper__step--active'
                    : s < stepNumber
                    ? 'stepper__step--completed'
                    : ''
                }`}
              >
                {s < stepNumber ? '✓' : s}
              </div>
              {i < 3 && (
                <div
                  className={`stepper__line ${s < stepNumber ? 'stepper__line--active' : ''}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Back Button */}
        {(step === 'soldier' || step === 'checklist') && (
          <button
            className="btn btn--secondary btn--small"
            onClick={handleBack}
            style={{ marginBottom: 'var(--space-lg)' }}
          >
            → חזרה
          </button>
        )}

        {/* Step Content */}
        {step === 'team' && <TeamSelector onSelect={handleTeamSelect} />}

        {step === 'soldier' && selectedTeam && (
          <SoldierSelector team={selectedTeam} onSelect={handleSoldierSelect} />
        )}

        {step === 'checklist' && selectedSoldier && selectedTeam && (
          <EquipmentChecklist
            soldier={selectedSoldier}
            teamName={selectedTeam.name}
            onComplete={handleVerificationComplete}
          />
        )}

        {step === 'success' && verificationResult && (
          <VerificationSuccess
            result={verificationResult}
            onReset={handleReset}
          />
        )}
      </main>
    </>
  );
}
