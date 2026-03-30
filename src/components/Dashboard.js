import React from 'react';
import PlayerDashboard from './PlayerDashboard';
import ScoutDashboard from './ScoutDashboard';
import AdminDashboard from './AdminDashboard';
import '../styles/dashboard.css';

export default function Dashboard({ user }) {
  // Route to appropriate dashboard based on user role
  if (user.role === 'player') {
    return <PlayerDashboard user={user} />;
  } else if (user.role === 'scout') {
    return <ScoutDashboard user={user} />;
  } else if (user.role === 'admin') {
    return <AdminDashboard user={user} />;
  }

  // Fallback for users without role
  return (
    <div className="dashboard container">
      <div className="dashboard-header">
        <h1>Welcome to ScoutBook!</h1>
        <p>Please complete your profile to get started.</p>
      </div>
    </div>
  );
}