import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 40, fullPage = false }) => {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem',
    }}>
      <div
        className="spinner"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      />
      {message && (
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {message}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
