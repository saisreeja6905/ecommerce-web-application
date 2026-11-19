import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current, and adjacent pages
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (
      (i === currentPage - 2 && i > 1) ||
      (i === currentPage + 2 && i < totalPages)
    ) {
      pages.push('...');
    }
  }

  // Remove contiguous duplicate ellipses
  const deduplicatedPages = pages.filter((item, index) => {
    return item !== '...' || pages[index - 1] !== '...';
  });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.4rem',
      marginTop: '2.5rem',
      marginBottom: '1rem',
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="btn btn-secondary btn-sm"
        style={{ padding: '0.4rem 0.6rem' }}
        title="Previous Page"
      >
        <ChevronLeft size={18} />
      </button>

      {deduplicatedPages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)' }}
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              minWidth: '38px',
              padding: '0.4rem 0.6rem',
              fontWeight: isActive ? 700 : 500,
            }}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="btn btn-secondary btn-sm"
        style={{ padding: '0.4rem 0.6rem' }}
        title="Next Page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
