// Simple PlannerContext to expose active user and helper utilities across the app.
// سياق بسيط للتطبيق لتمرير المستخدم النشط ووظائف الميديا والرفع للمكونات الأخرى
import React, { createContext } from 'react';

export const PlannerContext = createContext(null);

export const PlannerProvider = ({ children, value }) => {
  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
};