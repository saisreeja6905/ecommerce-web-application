import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onDismiss }) => {
  if (!message) return null;

  const icons = {
    error: <AlertCircle size={20} color="var(--danger)" />,
    success: <CheckCircle2 size={20} color="var(--success)" />,
    warning: <AlertTriangle size={20} color="var(--warning)" />,
    info: <Info size={20} color="var(--info)" />,
  };

  return (
    <div className={`alert alert-${type}`} style={{ position: 'relative' }}>
      <div style={{ flexShrink: 0 }}>{icons[type] || icons.info}</div>
      <div style={{ flex: 1, wordBreak: 'break-word' }}>{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: 'inherit',
            opacity: 0.7,
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
