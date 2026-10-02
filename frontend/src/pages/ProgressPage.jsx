import React from 'react';
import ProgressDashboard from '../components/ProgressDashboard';

export default function ProgressPage({ onStartPractice }) {
  return (
    <div>
      <ProgressDashboard onStartPractice={onStartPractice} />
    </div>
  );
}
