import React from 'react';

const EmptyState = ({ icon, title, message, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div style={{ marginTop: '20px' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
