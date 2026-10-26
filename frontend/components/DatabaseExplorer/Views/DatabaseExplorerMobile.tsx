import React from 'react';
import { useDatabaseExplorer } from '../useDatabaseExplorer';
import styles from '../DatabaseExplorer.module.scss';

export const DatabaseExplorerMobile: React.FC = () => {
  const {
    tables,
    activeTable,
    columns,
    rows,
    searchInput,
    setSearchInput,
    handleSearchSubmit,
    handlePrevPage,
    handleNextPage,
    currentPage,
    totalPages,
    isLoadingData,
    selectTable,
    isJsonValue,
    handleOpenJsonModal,
  } = useDatabaseExplorer();

  return (
    <div className={styles.explorerLayoutMobile}>
      {/* Table Selector */}
      <div>
        <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
          Select Table:
        </label>
        <select
          className={styles.mobileSelect}
          value={activeTable || ''}
          onChange={(e) => selectTable(e.target.value)}
        >
          {tables.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name} ({t.rowCount} rows)
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#fff',
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#38bdf8',
            color: '#0f172a',
            padding: '8px 14px',
            borderRadius: '6px',
            fontWeight: 600,
          }}
        >
          Go
        </button>
      </form>

      {/* Record Cards */}
      <div className={styles.mobileCardList}>
        {isLoadingData ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>Loading table...</p>
        ) : rows.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>No records found</p>
        ) : (
          rows.map((row, rIdx) => (
            <div key={rIdx} className={styles.mobileRecordCard}>
              {columns.slice(0, 6).map((col) => {
                const val = row[col];
                const isJson = isJsonValue(val);

                return (
                  <div key={col} className={styles.fieldRow}>
                    <span className={styles.fieldName}>{col}:</span>
                    <span className={styles.fieldValue}>
                      {isJson ? (
                        <button
                          className={styles.jsonBadge}
                          onClick={() => handleOpenJsonModal(col, val)}
                        >
                          View JSON
                        </button>
                      ) : val === null || val === undefined ? (
                        <span className={styles.nullCell}>null</span>
                      ) : (
                        String(val)
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1 || isLoadingData}
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: '6px',
          }}
        >
          Prev
        </button>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages || isLoadingData}
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: '6px',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};
