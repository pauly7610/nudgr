
import React from 'react';
import { FrictionDashboard } from '../components/FrictionDashboard';
import { SmartActionNudges } from '../components/SmartActionNudges';
import { SmartTestPlanner } from '../components/testing/SmartTestPlanner';

const Index = () => {
  return (
    <>
      <FrictionDashboard />
      
      <div className="container py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <SmartActionNudges />
        <SmartTestPlanner />
      </div>
    </>
  );
};

export default Index;
