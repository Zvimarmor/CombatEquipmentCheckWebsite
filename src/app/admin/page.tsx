'use client';

import { useState } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminNav from '@/components/AdminNav';
import AdminDashboard from '@/components/AdminDashboard';
import AdminAddSoldier from '@/components/AdminAddSoldier';
import AdminManageSoldiers from '@/components/AdminManageSoldiers';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('status');

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <header className="app-header">
        <h1 className="app-header__title">לוח בקרה — מפקד</h1>
        <p className="app-header__subtitle">ניהול בדיקת צל״ם</p>
      </header>

      <main className="page-container page-container--wide">
        <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'status' && <AdminDashboard />}
        {activeTab === 'add' && <AdminAddSoldier />}
        {activeTab === 'manage' && <AdminManageSoldiers />}
      </main>
    </>
  );
}
