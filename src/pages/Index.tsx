
import React from 'react';
import { FrictionDashboard } from '../components/FrictionDashboard';
import { SmartActionNudges } from '../components/SmartActionNudges';
import { SmartTestPlanner } from '../components/testing/SmartTestPlanner';

const Index = () => {
  return (
    <>
      <FrictionDashboard />
      
      <div className="container pb-8 grid grid-cols-1 gap-6">
        <SmartActionNudges />
        <SmartTestPlanner />
      </div>
    </>
  );
};

export default Index;
