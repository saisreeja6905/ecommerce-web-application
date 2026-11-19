import React from 'react';
import { Star } from 'lucide-react';

const Rating = ({ value = 0, numReviews, size = 16, showScore = true }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <div style={{ display: 'flex', gap: '1px' }}>
        {stars.map((star) => {
          const filled = value >= star;
          const half = !filled && value >= star - 0.5;

          return (
            <div key={star} style={{ position: 'relative', display: 'inline-block' }}>
              <Star
                size={size}
                color={filled || half ? '#f59e0b' : '#cbd5e1'}
                fill={filled ? '#f59e0b' : half ? '#f59e0b' : 'none'}
                strokeWidth={1.75}
              />
            </div>
          );
        })}
      </div>

      {showScore && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginLeft: '2px' }}>
          {Number(value).toFixed(1)}
        </span>
      )}

      {numReviews !== undefined && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ({numReviews})
        </span>
      )}
    </div>
  );
};

export default Rating;
